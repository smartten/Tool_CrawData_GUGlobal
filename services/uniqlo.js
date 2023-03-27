import axios from 'axios';
import cheerio from "cheerio";
import _ from 'lodash';
import { ProductUniQloModel } from '../models/uniqlo.model.js';
// Import helper functions
import { compose, composeAsync, enforceHttpsUrl, extractNumber, extractUrlAttribute, fetchElemAttribute, fetchElemInnerText, fetchHtmlFromUrlByScroll } from "../helper/helpers.js";
import { translateDataApi, translateJpToVi, translateJpToViWithArray } from '../helper/covert.js';


// scotch.io (Base URL)
const BASE_URL = "https://www.uniqlo.com";

///////////////////////////////////////////////////////////////////////////////
// HELPER FUNCTIONS
///////////////////////////////////////////////////////////////////////////////

/**
 * Resolves the url as relative to the base scotch url
 * and returns the full URL
 */
const scotchRelativeUrl = url =>
	_.isString(url) ? `$ BASE_URL}${url.replace(/^\/*?/, "/")}` : null;

/**
 * A composed function that extracts a url from element attribute,
 * resolves it to the Scotch base url and returns the url with https
 */
const extractScotchUrlAttribute = attr =>
	compose(enforceHttpsUrl, scotchRelativeUrl, fetchElemAttribute(attr));

///////////////////////////////////////////////////////////////////////////////
// EXTRACTION FUNCTIONS
///////////////////////////////////////////////////////////////////////////////

/**
 * Extract a single social URL pair from container element
 */
const extractSocialUrl = elem => {
	const icon = elem.find("span.icon");
	const regex = /^(?:icon|color)-(.+)$/;

	const onlySocialClasses = regex => (classes = "") => classes
		.replace(/\s+/g, " ")
		.split(" ")
		.filter(classname => regex.test(classname));

	const getSocialFromClasses = regex => classes => {
		let social = null;
		const [classname = null] = classes;

		if (_.isString(classname)) {
			const [, name = null] = classname.match(regex);
			social = name ? _.snakeCase(name) : null;
		}

		return social;
	};

	const href = extractUrlAttribute("href")(elem);

	const social = compose(
		getSocialFromClasses(regex),
		onlySocialClasses(regex),
		fetchElemAttribute("class")
	)(icon);

	return social && { [social]: href };
};

/**
 * Extract a single post from container element
 */
const extractPost = elem => {
	const title = elem.find('.card__title a');
	const image = elem.find('a[data-src]');
	const views = elem.find("a[title='Views'] span");
	const comments = elem.find("a[title='Comments'] span.comment-number");

	return {
		title: fetchElemInnerText(title),
		image: extractUrlAttribute('data-src')(image),
		url: extractScotchUrlAttribute('href')(title),
		views: extractNumber(views),
		comments: extractNumber(comments)
	};
};

/**
 * Extract a single stat from container element
 */
const extractStat = elem => {
	const statElem = elem.find(".stat")
	const labelElem = elem.find('.label');

	const lowercase = val => _.isString(val) ? val.toLowerCase() : null;

	const stat = extractNumber(statElem);
	const label = compose(lowercase, fetchElemInnerText)(labelElem);

	return { [label]: stat };
};

/**
	* Call api get detail product
 */
const reqApiDetailProduct = async (href) => {
	try {
		if (href) {
			return await axios
				.get(`${BASE_URL}${href}`)
				.then(response => {
					const dataConvertCheerio = cheerio.load(response.data)
					return dataConvertCheerio
				})
				.catch(error => {
					error.status = (error.response && error.response.status) || 500;
					throw error;
				});
		}
	} catch (error) {
		console.log("err", error);
	}
}
/**
 * Extract profile from a Scotch author's page using the Cheerio parser instance
 * and returns the author profile object
 */
const extractUniqQlo = async $ => {
	try {
		await ProductUniQloModel.deleteMany()
		const listProduct = $('.lazyload-wrapper').find('.fr-ec-product-tile-resize-wrapper')
		listProduct.each(async function (item, elem) {
			try {
				const elm = $(this)
                const img = elm.find('.fr-ec-product-tile__image').find('img').attr('src')
				const idProduct = elm.find('a').attr('id')

				const {data} = await axios.get(`https://www.uniqlo.com/jp/api/commerce/v5/ja/products/${idProduct}/price-groups/00/details?includeModelSize=true&httpFailure=true`)
				const dataConvert =await translateDataApi(data.result)

				const description = elm.find('.fr-ec-flag-text.fr-ec-flag--standard.fr-ec-text-align-left.fr-ec-flag-text--color-secondary.fr-ec-text-transform-normal').text()
				const stateFlags = elm.find('.fr-ec-product-tile__status-flags-list-item').find('p').text()
				const name = elm.find('.fr-ec-product-tile__end').find('h3').text()
				const price = elm.find('.fr-ec-product-tile__end').find('.fr-ec-price').find('p').text()

				const product = { img, description :await translateJpToVi(description), 
					stateFlags :await translateJpToViWithArray(stateFlags), 
					name :await translateJpToVi(name), 
					price ,
					...dataConvert
				};

				if (!await ProductUniQloModel.exists({ productId : dataConvert.productId })) {
					const newProduct = new ProductUniQloModel(product)
					await newProduct.save()
				}
			} catch (error) {
				console.log('err', error);

			}
        });
        
		return {
			message : 'done'
		}
	} catch (error) {
		console.log("err", error);

	}
};

/**
 * Fetches the Scotch profile of the given author
 */

const fetchProductUniQlo = url => {
	return composeAsync(extractUniqQlo, fetchHtmlFromUrlByScroll)(url);
};

export { fetchProductUniQlo };
