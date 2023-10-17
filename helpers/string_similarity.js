import stringSimilarity from "string-similarity";

const similarityScore = (str1, str2) => {
    return stringSimilarity.compareTwoStrings(str1, str2);
};

export { similarityScore };
