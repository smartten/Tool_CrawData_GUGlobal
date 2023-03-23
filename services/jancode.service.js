import axios from "axios";
import cheerio from "cheerio";

import { UpdateTimeModel } from "../models/update-time.js";
import { CategoryModel } from "../models/category.js";
import { ProductModel } from "../models/product.js";

const janCodeUrl = "https://www.jancode.xyz";

export const getUpdateTimes = async () => {
  let currentPage = 1;
  let listItemLength;
  while (listItemLength !== 0) {
    await axios
      .get(`https://www.jancode.xyz/history/?p=${currentPage}`)
      .then((response) => {
        let $ = cheerio.load(response.data);
        var listItem = $("li.news-list_item");
        listItemLength = listItem.length;
        $("li.news-list_item").each(async (index, element) => {
          $ = cheerio.load($(element).html());
          const time = $(".news-list_item_date").text().trim();
          const url =
            janCodeUrl + $(".news-list_item_headline > a").attr("href").trim();
          const name = $(".news-list_item_headline > a").text().trim();
          const checkExistUpdateTime = await UpdateTimeModel.exists({ time });
          if (!checkExistUpdateTime) {
            const newUpdateTime = new UpdateTimeModel({
              time,
              url,
              name,
            });
            console.log(newUpdateTime);
            await newUpdateTime.save();
          }
        });
        currentPage++;
      })
      .catch((error) => {
        console.log(error);
      });
  }
  return {
    message: "Get all update time successfully",
    success: true,
  };
};

export const getCategories = async () => {
  await axios
    .get(`https://www.jancode.xyz/genre/`)
    .then((response) => {
      let $ = cheerio.load(response.data);
      $("div.result-box").each(async (index, element) => {
        $ = cheerio.load($(element).html());
        const name = $(".title > a").text().trim();
        const image = janCodeUrl + $("a > .outline").attr("src")?.trim();
        const url = janCodeUrl + $(".title > a").attr("href")?.trim();
        const checkExistCategory = await CategoryModel.exists({ url });
        if (!checkExistCategory) {
          const newCategory = new CategoryModel({
            name,
            image,
            url,
          });
          console.log(newCategory);
          await newCategory.save();
        }
      });
    })
    .catch((error) => {
      console.log(error);
    });

  return {
    message: "Get all category successfully",
    success: true,
  };
};

export const getProducts = async ({ url }) => {
  let currentPage = 1;
  let listProductLength;
  while (listProductLength !== 0) {
    await axios
      .get(`${url}&p=${currentPage}`)
      .then((response) => {
        let $ = cheerio.load(response.data);
        var listProduct = $("div.result-box");
        listProductLength = listProduct.length;
        listProduct.each(async (index, element) => {
          $ = cheerio.load($(element).html());
          const janCode = $(".title > a").text().trim().split(":")[1];
          const urlProductDetail = janCodeUrl + $(".title > a").attr("href");
          await axios
            .get(urlProductDetail)
            .then(async (response) => {
              let $detail = cheerio.load(response.data);
              const name = $detail(
                ".table-block > tbody > tr > th:contains('商品名') + td"
              )
                .text()
                .trim();
              const image =
                janCodeUrl +
                $detail(".table-block > tbody > tr:nth-child(1) > td > img")
                  .attr("src")
                  .trim();
              let categories = [];
              $detail(
                ".table-block > tbody > tr > th:contains('商品ジャンル') + td > a"
              ).each((i, e) => {
                let category = $(e).text().trim();
                categories.push(category);
              });

              // const productLinkRakuten = $detail(
              //   ".table-block > tbody > tr > th:contains('価格調査') + td > div.col3-wrap > .col > a[href*='rakuten']"
              // )
              //   .attr("href")
              //   .trim();

              const checkExist = await ProductModel.exists({ janCode });
              if (!checkExist) {
                const productLinkYahoo = $detail(
                  ".table-block > tbody > tr > th:contains('価格調査') + td > div.col3-wrap > .col > a[href*='yahoo']"
                )
                  .attr("href")
                  .trim();

                await axios
                  .get(productLinkYahoo)
                  .then(async (response) => {
                    let $ref = await cheerio.load(response.data);
                    var priceYahoo =
                      (await $ref(
                        "div.SearchResult_SearchResult__fashionGridItem__vdTba:first-child > .SearchResult_SearchResult__item__PpMBo p.SearchResultItemPrice_SearchResultItemPrice__valueRow__vSauv"
                      )
                        .text()
                        .trim()) || "";
                    const newProduct = new ProductModel({
                      janCode,
                      name,
                      categories,
                      image,
                      shortNameCompany: "",
                      fullNameCompany: "",
                      material: "",
                      quantitative: "",
                      priceRakuten: "",
                      priceYahoo,
                      priceAmazone: "",
                    });
                    await newProduct.save();
                    console.log({ currentPage, status: "success" });
                  })
                  .catch((error) => {});
              }
              // axios
              //   .get(productLinkRakuten)
              //   .then(async (response) => {
              //     let $ref = cheerio.load(response.data);
              //     var priceRakuten =
              //       $ref(
              //         "div.searchresultitem:first-child .price-wrapper--F8UPj > .price--OX_YW"
              //       )
              //         .text()
              //         .trim() || "";
              //     await axios
              //       .get(productLinkYahoo)
              //       .then(async (response) => {
              //         let $ref = await cheerio.load(response.data);
              //         var priceYahoo =
              //           (await $ref(
              //             "div.SearchResult_SearchResult__fashionGridItem__vdTba:first-child > .SearchResult_SearchResult__item__PpMBo p.SearchResultItemPrice_SearchResultItemPrice__valueRow__vSauv"
              //           )
              //             .text()
              //             .trim()) || "";
              //         console.log({ priceRakuten, priceYahoo });
              //       })
              //       .catch((error) => {});
              //   })
              //   .catch((error) => {});
            })
            .catch((error) => {});
        });
      })
      .catch((error) => {
        listProductLength = 0;
      });
    currentPage++;
  }
  return {
    message: "Get all product successfully",
    success: true,
  };
};
