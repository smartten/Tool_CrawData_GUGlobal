import translate from "translate";

translate.engine = "google"; // Or "yandex", "libre", "deepl"
translate.key = process.env.GOOGLE_KEY;
translate.from = 'ja';
translate.to = 'vi';

export const translateJpToVi = async (text) => {
    if (text) {
        const newText = await translate(text);
        return newText
    }
    return text
}

export const translateJpToViWithArray = async (arr) => {
    if (typeof arr == 'object') {
        const newArr = arr.map(item => {
            if (typeof item) return translateJpToVi(item)
            return
        }
        )
        return newArr
    }
    return arr
}

export const translateJpToViWithObject = async (obj) => {
    Object.keys(obj).forEach(element => {
        if (typeof element == 'string') obj[element] = translateJpToVi(obj[element])
    });
    return obj
}

export const translateDataApi = async (data) => {
    let {
        breadcrumbs,
        careInstruction,
        colors,
        composition,
        designDetail,
        freeInformation,
        genderName,
        genderCategory,
        topCategories,
        images,
        l1Ids,
        longDescription,
        priceGroup,
        productId,
        productType,
        plds,
        representative,
        prices,
        taxPolicy,
        shortDescription,
        sizeChartUrl,
        sizeInformation,
        sizes,
        washingInformation,
        writeReviewAvailable,
        nextModelProducts,
        tags
    } = data
    // Object.keys(breadcrumbs).forEach(async element => {
    //     breadcrumbs[element] = await translateJpToViWithObject(breadcrumbs[element])
    // });
    return {
        breadcrumbs,
        careInstruction: await translateJpToVi(careInstruction),
        colors,
        composition: await translateJpToVi(composition),
        designDetail: await translateJpToVi(designDetail),
        freeInformation: await translateJpToVi(freeInformation),
        genderName,
        genderCategory,
        topCategories,
        images,
        l1Ids,
        longDescription: await translateJpToVi(longDescription),
        priceGroup,
        productId,
        productType,
        plds,
        representative,
        prices,
        taxPolicy,
        shortDescription,
        sizeChartUrl,
        sizeInformation,
        sizes,
        washingInformation: await translateJpToVi(washingInformation),
        writeReviewAvailable,
        nextModelProducts,
        tags
    }
}