import cheerio from "cheerio";
import puppeteer from 'puppeteer';
import { MenFashionProducts } from '../models/memfashion.model.js';
// Import helper functions
import { composeAsync, fetchHtmlFromUrlByScroll, formatNumber } from "../helper/helpers.js";
import axios from "axios";
import { translateJpToVi, translateJpToViWithArray, translateDataApi } from "../helper/covert.js"
import { WomenFashionProducts } from "../models/womenfashion.model.js";
import { KidsFashionProducts } from "../models/kidsfashion.model.js";
import { BabyFashionProducts } from "../models/babyfashion.model.js";


const BASE_URL = "https://www.gu-global.com";
var URL;

const modelWithMainCategory = (mainCategory) => {
	switch (mainCategory) {
		case 'women':
			return WomenFashionProducts
			break;
		case 'men':
			return MenFashionProducts
			break;
		case 'kids':
			return KidsFashionProducts
			break;
		case 'baby':
			return BabyFashionProducts
			break;
		default:
			throw Error("Main category invalid...!")
	}
}

const extract = async $ => {
	try {
		// await MenFashionProducts.deleteMany()
		//https://wise.com/rates/history+live?source=VND&target=JPY&length=30&resolution=hourly&unit=day
		const { data } = await axios.get('https://wise.com/rates/history+live?source=VND&target=JPY&length=1&resolution=hourly&unit=day')
		const exchangeRateFromJaToVi = data[data.length - 1]?.value
		const listProduct = $('section').find('.lazyload-wrapper').find('.fr-ec-product-tile-resize-wrapper')
		const baseUrl = URL.split('/').slice(0, 3).join('/')
		const arrCategory = URL.split('/').slice(5);
		const productType = {
			mainCategory: arrCategory[0],
			subCategory: arrCategory[1],
			product: arrCategory[2] || ''
		}
		const modelDatabase = modelWithMainCategory(arrCategory[0])
		listProduct.each(async function (item, elem) {
			try {
				const elm = $(this)
				const img = elm.find('.fr-ec-product-tile__image').find('img').attr('src')
				const idProduct = elm.find('a').attr('id')
				const { data } = await axios.get(`${baseUrl}/jp/api/commerce/v5/ja/products/${idProduct}/price-groups/00/details`, {
					params: {
						includeModelSize: true,
						httpFailure: true
					}
				})
				const dataConvert = data.result
				const description = elm.find('.fr-ec-flag-text.fr-ec-flag--standard.fr-ec-text-align-left.fr-ec-flag-text--color-secondary.fr-ec-text-transform-normal').text()
				const stateFlags = elm.find('.fr-ec-product-tile__status-flags-list-item').find('p').text()
				const name = elm.find('.fr-ec-product-tile__end').find('h3').text()
				const price = elm.find('.fr-ec-product-tile__end').find('.fr-ec-price').find('p').text()
				const product = {
					img, description,
					stateFlags,
					name,
					price,
					priceWithVND: `${formatNumber(+price.split('¥')[1].replace(',', '') / exchangeRateFromJaToVi)} VNĐ`,
					...dataConvert,
					productType


				};
				await modelDatabase.deleteOne({productId: dataConvert.productId})
				if (!await modelDatabase.exists({ productId: dataConvert.productId })) {
					const newProduct = new modelDatabase(product)
					await newProduct.save()
				}
			} catch (error) {
				console.log('err', error);

			}
		});

		return {
			message: 'done'
		}
	} catch (error) {
		console.log("err", error);

	}
};

const fetchProduct = url => {
	URL = url
	return composeAsync(extract, fetchHtmlFromUrlByScroll)(url);
};

export { fetchProduct };

