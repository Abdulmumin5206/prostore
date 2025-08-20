#!/usr/bin/env ts-node

import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import { parse as parseCsv } from 'csv-parse/sync'

type CsvRow = Record<string, string>

type ProductCsv = {
	brand: string
	category: string
	family?: string
	model?: string
	variant?: string
	title: string
	description?: string
	published?: string
	public_id: string
	colors_list?: string // "Name;Name;Name"
	primary_color?: string
}

type ImageCsv = {
	product_public_id: string
	file_or_url: string
	is_primary?: string
	sort_order?: string
	color?: string // can be a color name or 'Common'
}

function requireEnv(name: string): string {
	const v = process.env[name]
	if (!v) throw new Error(`Missing env var ${name}`)
	return v
}

function slugify(input: string): string {
	return (input || '')
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^a-z0-9\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
}

function toBool(v: string | undefined): boolean {
	if (!v) return false
	const s = v.toString().trim().toLowerCase()
	return s === 'true' || s === '1' || s === 'yes' || s === 'y'
}

function guessContentType(filename: string): string {
	const ext = path.extname(filename).toLowerCase()
	switch (ext) {
		case '.jpg':
		case '.jpeg':
			return 'image/jpeg'
		case '.png':
			return 'image/png'
		case '.webp':
			return 'image/webp'
		default:
			return 'application/octet-stream'
	}
}

function titleCaseWords(input: string): string {
	return input
		.split(/\s+/)
		.filter(Boolean)
		.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
		.join(' ')
}

function prefixForPublicId(publicId: string, title?: string): string {
	const map: Record<string, string> = {
		IPH16: 'iph16',
		IPH16PLUS: 'iph16plus',
		IPH16PRO: 'iph16pro',
		IPH16PROMAX: 'iph16promax',
	}
	if (map[publicId]) return map[publicId]
	const t = (title || '').toLowerCase()
	if (t.includes('iphone 16 pro max')) return 'iph16promax'
	if (t.includes('iphone 16 pro')) return 'iph16pro'
	if (t.includes('iphone 16 plus')) return 'iph16plus'
	if (t.includes('iphone 16')) return 'iph16'
	return publicId.toLowerCase()
}

function normalizeDiscoveredColorForProduct(publicId: string, colorTitle: string): string {
	// Normalize Midnight -> Black for iPhone 16 base, to align with requested naming
	if (publicId === 'IPH16' && colorTitle === 'Midnight') {
		return 'Black'
	}
	return colorTitle
}

function sortColorFiles(files: string[], prefix: string): string[] {
	return files.slice().sort((a, b) => {
		const na = a.toLowerCase()
		const nb = b.toLowerCase()
		const aMain = /-main\./i.test(a)
		const bMain = /-main\./i.test(b)
		if (aMain && !bMain) return -1
		if (!aMain && bMain) return 1
		// numeric suffix
		const aNum = (na.match(/(\d+)(?=\.[^.]+$)/) || [])[1]
		const bNum = (nb.match(/(\d+)(?=\.[^.]+$)/) || [])[1]
		if (aNum && bNum) return Number(aNum) - Number(bNum)
		if (aNum) return -1
		if (bNum) return 1
		return na.localeCompare(nb)
	})
}

function listAllImageFiles(root: string): string[] {
	const results: string[] = []
	function walk(dir: string) {
		if (!fs.existsSync(dir)) return
		const entries = fs.readdirSync(dir, { withFileTypes: true })
		for (const e of entries) {
			const full = path.join(dir, e.name)
			if (e.isDirectory()) {
				walk(full)
			} else {
				if (/(\.jpg|\.jpeg|\.png|\.webp)$/i.test(e.name)) {
					results.push(path.relative(root, full))
				}
			}
		}
	}
	walk(root)
	return results
}

function discoverLocalImagesForProduct(localRoot: string, publicId: string, title?: string): { hero: string | null; common: string[]; byColor: Map<string, string[]>; discoveredColors: Set<string> } {
	const prefix = prefixForPublicId(publicId, title)
	const allRel = listAllImageFiles(localRoot)
	const images = allRel
	const common: string[] = []
	const byColor = new Map<string, string[]>()
	const discoveredColors = new Set<string>()
	let hero: string | null = null

	const colorTokenMap: Array<{ token: string; color: string }> = [
		{ token: 'ultramarine', color: 'Ultramarine' },
		{ token: 'teal', color: 'Teal' },
		{ token: 'pink', color: 'Pink' },
		{ token: 'white', color: 'White' },
		{ token: 'black', color: 'Black' },
		{ token: 'midnight', color: 'Black' },
	]

	const exactPrefixRegex = new RegExp(`^${prefix}(?:[-_.])`, 'i')

	for (const relPath of images) {
		const base = path.basename(relPath)
		const nameNoExt = base.replace(/\.[^.]+$/, '')
		const lowerBase = base.toLowerCase()
		const lowerRel = relPath.toLowerCase()
		const dirLower = path.dirname(lowerRel)
		const inIphone16Dir = /iphone\s*16/.test(dirLower)

		// Product hero image detection: *main_main*
		const hasMainMain = /(^|[-_.])main_main(?![a-z])/i.test(nameNoExt)
		if (hasMainMain) {
			// Only accept when it clearly belongs to this product
			if (exactPrefixRegex.test(base) || (publicId === 'IPH16' && inIphone16Dir)) {
				// Keep the first encountered hero image
				if (!hero) hero = relPath
			}
			continue
		}

		// Common image detection must be product-scoped
		// Only accept when filename starts with the product prefix (e.g., iph16-common-*.jpg)
		// OR when inside the specific 'Iphone 16' directory and filename belongs to base model
		let colorTitle: string | null = null
		const isCommonForThisProduct = (() => {
			const hasCommonToken = /(^|[-_.])common(?![a-z])/i.test(nameNoExt)
			if (!hasCommonToken) return false
			if (exactPrefixRegex.test(base)) return true
			if (publicId === 'IPH16' && inIphone16Dir) {
				const baseModelName = /^iph?16(?!pro|plus|promax)/i.test(lowerBase)
				const plainIphone16 = /iphone\s*16(?!\s*(pro|max|plus))/i.test(lowerBase)
				return baseModelName || plainIphone16
			}
			return false
		})()
		if (isCommonForThisProduct) {
			common.push(relPath)
			continue
		}

		// Derive color title from filename
		if (exactPrefixRegex.test(base)) {
			// Files like iph16-ultramarine-main.jpg or iph16-white1.jpg
			let rest = nameNoExt.replace(new RegExp(`^${prefix}(?:[-_.])`, 'i'), '')
			rest = rest.trim()
			// Remove trailing -main or digits
			rest = rest.replace(/-?main$/i, '')
			rest = rest.replace(/(\d+)$/i, '')
			rest = rest.trim().replace(/[-_]+/g, ' ').replace(/\s+/g, ' ')
			if (rest) colorTitle = titleCaseWords(rest)
		} else if (publicId === 'IPH16' && inIphone16Dir) {
			// Token-based color detection only within the 'Iphone 16' folder and base model filenames
			const baseModelName = /^iph?16(?!pro|plus|promax)/i.test(lowerBase)
			const plainIphone16 = /iphone\s*16(?!\s*(pro|max|plus))/i.test(lowerBase)
			if (baseModelName || plainIphone16) {
				for (const { token, color } of colorTokenMap) {
					if (lowerRel.includes(token)) { colorTitle = color; break }
				}
			}
		}

		if (!colorTitle) continue
		colorTitle = normalizeDiscoveredColorForProduct(publicId, colorTitle)
		discoveredColors.add(colorTitle)
		const list = byColor.get(colorTitle) || []
		list.push(relPath)
		byColor.set(colorTitle, list)
	}

	// Sort files within each color group
	for (const [color, list] of byColor.entries()) {
		byColor.set(color, sortColorFiles(list, prefix))
	}
	return { hero, common: sortColorFiles(common, prefix), byColor, discoveredColors }
}

async function main() {
	const supabaseUrl = requireEnv('VITE_SUPABASE_URL')
	const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
	const supabaseKey = serviceRole || requireEnv('VITE_SUPABASE_ANON_KEY')
	const supabase = createClient(supabaseUrl, supabaseKey)

	const csvDir = path.resolve('docs', 'csv')
	const productsCsvPath = path.join(csvDir, 'Products.csv')
	const imagesCsvPath = path.join(csvDir, 'Images.csv')

	const parse = <T extends CsvRow>(file: string): T[] => {
		if (!fs.existsSync(file)) return [] as any[]
		const text = fs.readFileSync(file, 'utf8')
		return parseCsv(text, { columns: true, skip_empty_lines: true, trim: true }) as T[]
	}

	const products = parse<ProductCsv>(productsCsvPath)
	const images = parse<ImageCsv>(imagesCsvPath)

	console.log('Loaded: ', {
		products: products.length,
		images: images.length,
	})
	console.log(serviceRole ? 'Using service role for full import capabilities.' : 'Using anon key. Image uploads and some inserts may be restricted.')

	// Build image map: public_id -> { common?: ImageCsv[], byColor: Map<colorName, ImageCsv[]> }
	const productIdToImages: Record<string, { common: ImageCsv[]; byColor: Map<string, ImageCsv[]> }> = {}
	for (const row of images) {
		const pid = row.product_public_id?.trim()
		if (!pid) continue
		if (!productIdToImages[pid]) {
			productIdToImages[pid] = { common: [], byColor: new Map() }
		}
		const color = (row.color || '').trim()
		if (!color || color.toLowerCase() === 'common') {
			productIdToImages[pid].common.push(row)
		} else {
			const list = productIdToImages[pid].byColor.get(color) || []
			list.push(row)
			productIdToImages[pid].byColor.set(color, list)
		}
	}

	// Ensure brand and category IDs
	async function ensureBrandId(name: string): Promise<string> {
		const slug = slugify(name)
		let { data, error } = await supabase.from('brands').select('id').eq('slug', slug).maybeSingle()
		if (error) throw error
		if (data?.id) return data.id
		const { data: ins, error: insErr } = await supabase.from('brands').insert({ name, slug }).select('id').single()
		if (insErr) throw insErr
		return ins.id
	}
	async function ensureCategoryId(name: string): Promise<string> {
		const slug = slugify(name)
		let { data, error } = await supabase.from('categories').select('id').eq('slug', slug).maybeSingle()
		if (error) throw error
		if (data?.id) return data.id
		const { data: ins, error: insErr } = await supabase.from('categories').insert({ name, slug }).select('id').single()
		if (insErr) throw insErr
		return ins.id
	}

	// Price defaults by variant
	function defaultPriceForVariant(variant: string | undefined): number {
		const v = (variant || '').trim().toLowerCase()
		if (v === 'pro max') return 1299
		if (v === 'pro') return 1199
		if (v === 'plus') return 899
		return 799
	}

	const imageLocalRoot = path.resolve('public', 'import_images')
	const bucket = 'product-images'

	for (const p of products) {
		const brandId = await ensureBrandId(p.brand)
		const categoryId = await ensureCategoryId(p.category)
		const published = toBool(p.published)
		const family = p.family?.trim() || null
		const model = p.model?.trim() || null
		const variant = p.variant?.trim() || null
		const publicId = p.public_id.trim()
		if (!publicId) {
			console.warn(`Skipping product with empty public_id: ${p.title}`)
			continue
		}

		// Upsert product
		const upsertProduct = {
			brand_id: brandId,
			category_id: categoryId,
			family,
			model,
			variant,
			title: p.title,
			description: p.description || null,
			published,
			public_id: publicId,
		}
		const { data: upserted, error: upErr } = await supabase
			.from('products')
			.upsert(upsertProduct, { onConflict: 'public_id' })
			.select('id')
			.single()
		if (upErr) throw upErr
		const productId = upserted.id as string

		// Parse colors list
		const colorNames = (p.colors_list || '')
			.split(';')
			.map(s => s.trim())
			.filter(Boolean)

		// Discover local images and colors from filesystem
		const discovered = discoverLocalImagesForProduct(imageLocalRoot, publicId, p.title)

		// Build union of CSV colors and discovered colors for SKU creation
		const allColorNamesSet = new Set<string>(colorNames)
		for (const c of discovered.discoveredColors.values()) allColorNamesSet.add(c)
		const allColorNames = Array.from(allColorNamesSet)

		// Build SKUs per color (union)
		const basePrice = defaultPriceForVariant(variant || undefined)
		for (const colorName of allColorNames) {
			const colorSlug = slugify(colorName)
			const skuCode = `${publicId}-new-${colorSlug}`

			// Upsert SKU
			const skuPayload = {
				product_id: productId,
				condition: 'new',
				attributes: { color: colorName },
				is_active: true,
				sku_code: skuCode,
			}
			const { data: skuIns, error: skuErr } = await supabase
				.from('product_skus')
				.upsert(skuPayload, { onConflict: 'sku_code' })
				.select('id')
				.single()
			if (skuErr) throw skuErr
			const skuId = skuIns.id as string

			// Upsert price
			const pricePayload = { sku_id: skuId, currency: 'USD', base_price: basePrice }
			const { error: priceErr } = await supabase
				.from('sku_prices')
				.upsert(pricePayload)
			if (priceErr) throw priceErr

			// Upsert inventory
			const inventoryPayload = { sku_id: skuId, quantity: 5 }
			const { error: invErr } = await supabase
				.from('sku_inventory')
				.upsert(inventoryPayload)
			if (invErr) throw invErr
		}

		// Images: merge CSV-declared and discovered local images; ensure exactly one primary
		const imgGroup = productIdToImages[publicId] || { common: [], byColor: new Map<string, ImageCsv[]>() }
		// Merge discovered commons
		const seen = new Set<string>()
		for (const img of imgGroup.common) seen.add(img.file_or_url.toLowerCase())
		for (const f of discovered.common) {
			if (!seen.has(f.toLowerCase())) {
				imgGroup.common.push({ product_public_id: publicId, file_or_url: f })
				seen.add(f.toLowerCase())
			}
		}
		// Merge discovered byColor
		for (const [colorName, files] of discovered.byColor.entries()) {
			if (!imgGroup.byColor.has(colorName)) imgGroup.byColor.set(colorName, [])
			const arr = imgGroup.byColor.get(colorName)!
			const localSeen = new Set(arr.map(x => x.file_or_url.toLowerCase()))
			for (const f of files) {
				if (!localSeen.has(f.toLowerCase())) {
					arr.push({ product_public_id: publicId, file_or_url: f, color: colorName })
					localSeen.add(f.toLowerCase())
				}
			}
			imgGroup.byColor.set(colorName, arr)
		}

		const rowsToInsert: Array<{ product_id: string; url: string; is_primary: boolean; sort_order: number; color?: string | null }> = []
		{
			let sort = 1
			let primaryAssigned = false
			const dedup = new Set<string>()
			// Prefer color-specific classification over common for duplicate files
			const colorFilesLower = new Set<string>()
			for (const arr of imgGroup.byColor.values()) {
				for (const it of arr) colorFilesLower.add(it.file_or_url.toLowerCase())
			}

			// 0) If there is a hero image for the product, make it primary first
			if (discovered.hero) {
				try {
					const url = await uploadIfLocalAndGetUrl(supabase as any, bucket, imageLocalRoot, publicId, discovered.hero)
					rowsToInsert.push({ product_id: productId, url, is_primary: true, sort_order: sort++, color: null })
					primaryAssigned = true
					dedup.add(discovered.hero.toLowerCase())
				} catch (e: any) {
					if (!(typeof e?.message === 'string' && e.message.includes('Local image not found'))) throw e
				}
			}

			if (imgGroup.common.length > 0) {
				for (let i = 0; i < imgGroup.common.length; i++) {
					const img = imgGroup.common[i]
					// If this file is also present as a color-specific image, skip adding it as common
					if (colorFilesLower.has(img.file_or_url.toLowerCase())) continue
					try {
						if (dedup.has(img.file_or_url.toLowerCase())) continue
						const url = await uploadIfLocalAndGetUrl(supabase as any, bucket, imageLocalRoot, publicId, img.file_or_url)
						const isPrimary = !primaryAssigned && i === 0
						rowsToInsert.push({ product_id: productId, url, is_primary: isPrimary, sort_order: sort++, color: null })
						if (isPrimary) primaryAssigned = true
						dedup.add(img.file_or_url.toLowerCase())
					} catch (e: any) {
						if (typeof e?.message === 'string' && e.message.includes('Local image not found')) {
							// Skip missing local file; discovery will likely provide images
							continue
						}
						throw e
					}
				}
			}

			// Ordered colors: prefer CSV order, then discovered extras alphabetically
			let orderedColors = Array.from(new Set<string>([...colorNames, ...Array.from(discovered.discoveredColors).sort()]))
			// Respect primary_color from CSV if provided; otherwise prefer Black
			const desiredPrimary = (p.primary_color || '').trim()
			if (desiredPrimary) {
				const hasDesired = orderedColors.some(c => c.toLowerCase() === desiredPrimary.toLowerCase())
				if (hasDesired) {
					orderedColors = [desiredPrimary, ...orderedColors.filter(c => c.toLowerCase() !== desiredPrimary.toLowerCase())]
				}
			} else {
				const hasBlack = orderedColors.some(c => c.toLowerCase() === 'black')
				if (hasBlack) {
					orderedColors = ['Black', ...orderedColors.filter(c => c.toLowerCase() !== 'black')]
				}
			}
			for (const colorName of orderedColors) {
				const list = imgGroup.byColor.get(colorName)
				if (!list || list.length === 0) continue
				// Sort: main first then numeric
				const sortedFiles = sortColorFiles(list.map(x => x.file_or_url), prefixForPublicId(publicId, p.title))
				for (let i = 0; i < sortedFiles.length; i++) {
					const f = sortedFiles[i]
					try {
						if (dedup.has(f.toLowerCase())) continue
						const url = await uploadIfLocalAndGetUrl(supabase as any, bucket, imageLocalRoot, publicId, f)
						const isPrimary = !primaryAssigned && i === 0 && orderedColors[0] === colorName
						rowsToInsert.push({ product_id: productId, url, is_primary: isPrimary, sort_order: sort++, color: colorName })
						if (isPrimary) primaryAssigned = true
						dedup.add(f.toLowerCase())
					} catch (e: any) {
						if (typeof e?.message === 'string' && e.message.includes('Local image not found')) {
							continue
						}
						throw e
					}
				}
			}
		}

		if (rowsToInsert.length > 0) {
			await supabase.from('product_images').delete().eq('product_id', productId)
			const { error: insErr } = await supabase.from('product_images').insert(rowsToInsert)
			if (insErr) throw insErr
		}

		console.log(`Imported product ${publicId} (${p.title}) with ${allColorNames.length} colors and ${rowsToInsert.length} images`)
	}

	console.log('Import completed.')
}

async function uploadIfLocalAndGetUrl(
	supabase: any,
	bucket: string,
	localRoot: string,
	publicId: string,
	fileOrUrl: string
): Promise<string> {
	const isRemote = /^https?:\/\//i.test(fileOrUrl)
	let buffer: Buffer
	let storagePath: string
	if (isRemote) {
		const fetchFn: any = (globalThis as any).fetch
		if (!fetchFn) throw new Error('Remote URL detected but no global fetch available. Use local file instead.')
		const res = await fetchFn(fileOrUrl)
		if (!res.ok) throw new Error(`Failed to download ${fileOrUrl}: ${res.status}`)
		const arr = await res.arrayBuffer()
		buffer = Buffer.from(arr)
		const name = path.basename(new URL(fileOrUrl).pathname)
		storagePath = `product/${publicId}/${name}`
	} else {
		const localPath = path.join(localRoot, fileOrUrl)
		if (!fs.existsSync(localPath)) throw new Error(`Local image not found: ${localPath}`)
		buffer = fs.readFileSync(localPath)
		storagePath = `product/${publicId}/${path.basename(fileOrUrl)}`
	}
	const contentType = guessContentType(storagePath)
	const { error: upErr } = await supabase.storage.from(bucket).upload(storagePath, buffer, { contentType, upsert: true })
	if (upErr && upErr.message && !upErr.message.includes('The resource already exists')) throw upErr
	const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath)
	return data.publicUrl
}

main().catch(err => {
	console.error(err)
	process.exit(1)
}) 