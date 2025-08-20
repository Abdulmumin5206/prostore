#!/usr/bin/env ts-node

import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

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

		const hasMainMain = /(^|[-_.])main_main(?![a-z])/i.test(nameNoExt)
		if (hasMainMain) {
			if (exactPrefixRegex.test(base) || (publicId === 'IPH16' && inIphone16Dir)) {
				if (!hero) hero = relPath
			}
			continue
		}

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

		if (exactPrefixRegex.test(base)) {
			let rest = nameNoExt.replace(new RegExp(`^${prefix}(?:[-_.])`, 'i'), '')
			rest = rest.trim()
			rest = rest.replace(/-?main$/i, '')
			rest = rest.replace(/(\d+)$/i, '')
			rest = rest.trim().replace(/[-_]+/g, ' ').replace(/\s+/g, ' ')
			if (rest) colorTitle = titleCaseWords(rest)
		} else if (publicId === 'IPH16' && inIphone16Dir) {
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

	for (const [color, list] of byColor.entries()) {
		byColor.set(color, sortColorFiles(list, prefix))
	}
	return { hero, common: sortColorFiles(common, prefix), byColor, discoveredColors }
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

async function main() {
	const supabaseUrl = requireEnv('VITE_SUPABASE_URL')
	const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
	const supabaseKey = serviceRole || requireEnv('VITE_SUPABASE_ANON_KEY')
	const supabase = createClient(supabaseUrl, supabaseKey)

	const brandName = 'Apple'
	const categoryName = 'Phones'
	const family = 'iPhone'
	const model = 'iPhone 16'
	const productTitle = 'Apple iPhone 16'
	const publicId = 'IPH16'
	const published = true

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

	function defaultPrice(): number {
		return 799
	}
	function defaultStorages(): string[] {
		return ['128GB', '256GB', '512GB']
	}

	const brandId = await ensureBrandId(brandName)
	const categoryId = await ensureCategoryId(categoryName)

	const upsertProduct = {
		brand_id: brandId,
		category_id: categoryId,
		family,
		model,
		variant: null as string | null,
		title: productTitle,
		description: null as string | null,
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

	// Global cleanup for this product/publicId: remove prior product images and SKUs (by product and by sku_code prefix)
	{
		// Remove product images for this product
		const { error: delImgErr } = await supabase.from('product_images').delete().eq('product_id', productId)
		if (delImgErr) throw delImgErr

		// Gather SKUs to delete: by product_id and by sku_code prefix
		const skuPrefix = `${publicId}-new-`
		const [byProduct, byPrefix] = await Promise.all([
			supabase.from('product_skus').select('id').eq('product_id', productId),
			supabase.from('product_skus').select('id, sku_code').like('sku_code', `${skuPrefix}%`),
		])
		if (byProduct.error) throw byProduct.error
		if (byPrefix.error) throw byPrefix.error
		const skuIds = Array.from(new Set([...(byProduct.data || []).map(r => r.id as string), ...(byPrefix.data || []).map(r => r.id as string)]))
		if (skuIds.length > 0) {
			const { error: delPricesErr } = await supabase.from('sku_prices').delete().in('sku_id', skuIds)
			if (delPricesErr) throw delPricesErr
			const { error: delInvErr } = await supabase.from('sku_inventory').delete().in('sku_id', skuIds)
			if (delInvErr) throw delInvErr
			const { error: delSkusErr } = await supabase.from('product_skus').delete().in('id', skuIds)
			if (delSkusErr) throw delSkusErr
		}
	}

	const imageLocalRoot = path.resolve('public', 'import_images')
	const bucket = 'product-images'

	// Discover images from local filesystem
	const discovered = discoverLocalImagesForProduct(imageLocalRoot, publicId, productTitle)

	// Colors and storages
	const csvColors: string[] = ['Black', 'White', 'Ultramarine', 'Teal', 'Pink']
	const allColorNamesSet = new Set<string>(csvColors)
	for (const c of discovered.discoveredColors.values()) allColorNamesSet.add(c)
	const allColorNames = Array.from(allColorNamesSet)

	const storages = defaultStorages()
	const desiredPrimaryColor = 'Black'
	const desiredPrimaryStorage = '128GB'
	if (desiredPrimaryColor) {
		const hasDesired = allColorNames.some(c => c.toLowerCase() === desiredPrimaryColor.toLowerCase())
		if (hasDesired) {
			const ordered = [desiredPrimaryColor, ...allColorNames.filter(c => c.toLowerCase() !== desiredPrimaryColor.toLowerCase())]
			allColorNames.length = 0
			allColorNames.push(...ordered)
		}
	}
	if (desiredPrimaryStorage) {
		const idx = storages.findIndex(s => s.toLowerCase() === desiredPrimaryStorage.toLowerCase())
		if (idx > -1) {
			storages.splice(0, 0, ...storages.splice(idx, 1))
		}
	}

	// Create SKUs per color + storage
	const basePrice = defaultPrice()
	for (const colorName of allColorNames) {
		for (const storageName of storages) {
			const colorSlug = slugify(colorName)
			const storageSlug = slugify(storageName)
			const skuCode = `${publicId}-new-${colorSlug}-${storageSlug}`
			const skuPayload = {
				product_id: productId,
				condition: 'new',
				attributes: { color: colorName, storage: storageName },
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

			const pricePayload = { sku_id: skuId, currency: 'USD', base_price: basePrice }
			const { error: priceErr } = await supabase
				.from('sku_prices')
				.upsert(pricePayload)
			if (priceErr) throw priceErr

			const inventoryPayload = { sku_id: skuId, quantity: 5 }
			const { error: invErr } = await supabase
				.from('sku_inventory')
				.upsert(inventoryPayload)
			if (invErr) throw invErr
		}
	}

	// Build and upload images
	const rowsToInsert: Array<{ product_id: string; url: string; is_primary: boolean; sort_order: number; color?: string | null }> = []
	{
		let sort = 1
		let primaryAssigned = false
		const dedup = new Set<string>()
		const colorFilesLower = new Set<string>()
		for (const arr of discovered.byColor.values()) {
			for (const it of arr) colorFilesLower.add(it.toLowerCase())
		}

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

		if (discovered.common.length > 0) {
			for (let i = 0; i < discovered.common.length; i++) {
				const f = discovered.common[i]
				if (colorFilesLower.has(f.toLowerCase())) continue
				try {
					if (dedup.has(f.toLowerCase())) continue
					const url = await uploadIfLocalAndGetUrl(supabase as any, bucket, imageLocalRoot, publicId, f)
					const isPrimary = !primaryAssigned && i === 0
					rowsToInsert.push({ product_id: productId, url, is_primary: isPrimary, sort_order: sort++, color: null })
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

		let orderedColors = Array.from(new Set<string>([...allColorNames]))
		if (desiredPrimaryColor) {
			const hasDesired = orderedColors.some(c => c.toLowerCase() === desiredPrimaryColor.toLowerCase())
			if (hasDesired) {
				orderedColors = [desiredPrimaryColor, ...orderedColors.filter(c => c.toLowerCase() !== desiredPrimaryColor.toLowerCase())]
			}
		}
		for (const colorName of orderedColors) {
			const list = discovered.byColor.get(colorName)
			if (!list || list.length === 0) continue
			const sortedFiles = sortColorFiles(list, prefixForPublicId(publicId, productTitle))
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

	console.log(`Imported unified ${publicId} (${productTitle}) with ${allColorNames.length} colors, ${storages.length} storages and ${rowsToInsert.length} images`)
}

main().catch(err => {
	console.error(err)
	process.exit(1)
}) 