import axios from "axios";
import cheerio from "cheerio";

export const getOrderHistories = async () => {
  await axios
    .get(
      `https://www.amazon.co.jp/gp/your-account/order-history/ref=ppx_yo_dt_b_pagination_3_1?ie=UTF8&delegatedCustId=ALU8RNTS9TA3I&orderFilter=year-2022&search=&startIndex=0`
    )
    .then((response) => {
      console.log(response);
      let $ = cheerio.load(response.data);
      $("div.a-box-group").each(async (index, element) => {
        $ = cheerio.load($(element).html());
        const orderDate = $("a-column:nth-child(1) font").text().trim();
        const receiverName = $("a-column:nth-child(1) > .trigger-text front")
          .text()
          .trim();
        const purchaserName = $("a-column:nth-child(2) > .trigger-text front")
          .text()
          .trim();
        console.log({ orderDate, receiverName, purchaserName });
      });
    })
    .catch((error) => {
      console.log(error);
    });

  return {
    message: "Get all order history successfully",
    success: true,
  };
};
