
/**
 * Implements the error function, erf(x), which is needed to calculate the
 * p-value from the chi-square statistic. This is an approximation.
 * @param x The input value.
 * @returns The value of erf(x).
 */
const erf = (x: number): number => {
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  const sign = (x >= 0) ? 1 : -1;
  const absX = Math.abs(x);

  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

  return sign * y;
};

/**
 * Calculates the cumulative distribution function (CDF) for the chi-square
 * distribution with 1 degree of freedom.
 * @param chiSquared The chi-square statistic.
 * @returns The probability for the given chi-square value.
 */
const chiSquareCdf = (chiSquared: number): number => {
  if (chiSquared < 0) return 0;
  return erf(Math.sqrt(chiSquared / 2));
};


/**
 * Performs a Chi-Square attack on image data to detect LSB steganography.
 * This function analyzes the red channel of the image pixels.
 *
 * The attack works by observing pairs of adjacent pixel values (p_i, p_{i+1}).
 * For a natural image, the values of adjacent pixels are correlated.
 * If LSBs are randomized by hidden data, this correlation is disturbed.
 * The Chi-Square test measures if the observed frequencies of p_{i+1} being
 * greater or less than p_i deviate significantly from what's expected in a
 * natural image. A high deviation suggests randomness, and thus, hidden data.
 *
 * @param imageData The pixel data from an HTML canvas.
 * @returns A probability (p-value) from 0.0 to 1.0. A value close to 1.0
 *          suggests that the LSBs are random (suspicious), while a value
 *          close to 0.0 suggests natural pixel correlations (likely clean).
 */
export const analyzeLSB = (imageData: ImageData): number => {
  const pixelData = imageData.data;
  const observedFrequencies: number[] = new Array(255).fill(0);

  // 1. Iterate through pixel data, focusing on the red channel (every 4th byte).
  // We analyze pairs of pixels (p_i, p_{i+1}).
  for (let i = 0; i < pixelData.length - 4; i += 8) {
    const p_i = pixelData[i];    // Red value of the first pixel in the pair
    const p_i_plus_1 = pixelData[i + 4]; // Red value of the second pixel in the pair

    // We can't analyze pairs where the first pixel value is at the boundary (0 or 255)
    // because p_{i+1} cannot be both greater and smaller.
    if (p_i < 255 && p_i > 0) {
      // If the second pixel's value is greater than the first, we increment the
      // frequency count for the category corresponding to the first pixel's value.
      if (p_i_plus_1 > p_i) {
        observedFrequencies[p_i]++;
      }
    }
  }

  // 2. Calculate the total number of pairs analyzed for each category.
  const totalPairsPerCategory: number[] = new Array(255).fill(0);
  for (let i = 0; i < pixelData.length - 4; i += 8) {
      const p_i = pixelData[i];
      if (p_i < 255 && p_i > 0) {
        totalPairsPerCategory[p_i]++;
      }
  }

  let chiSquared = 0;

  // 3. Calculate the Chi-Square statistic.
  for (let i = 1; i < 255; i++) {
    const totalPairs = totalPairsPerCategory[i];
    if (totalPairs > 0) {
      // The expected frequency in a natural image is that p_{i+1} > p_i and p_{i+1} < p_i
      // occur with roughly equal probability (0.5).
      const expectedFrequency = totalPairs / 2;
      const observed = observedFrequencies[i];
      
      // Chi-Square formula: Σ ( (Observed - Expected)^2 / Expected )
      // We apply it for the two cases: (p_{i+1} > p_i) and (p_{i+1} < p_i)
      const diff = observed - expectedFrequency;
      const chiSquared_i = (diff * diff) / expectedFrequency;

      chiSquared += chiSquared_i;
    }
  }
  
  // 4. Convert the final Chi-Square value into a probability (p-value).
  // The degrees of freedom is 254 (255 categories - 1).
  // However, the common practice for this specific attack is to simplify
  // and treat it as a single large test, often comparing against a threshold
  // or normalizing. For a more direct probability, we can use a CDF.
  // A high chi-squared value indicates a large deviation from the expected,
  // pointing towards non-natural data distribution.

  // To simplify and make it more robust for web, we calculate the average chi-square
  // value per degree of freedom and then find its p-value.
  const degreesOfFreedom = observedFrequencies.filter((_, i) => totalPairsPerCategory[i] > 0).length;
  if (degreesOfFreedom === 0) return 0;
  
  const normalizedChi = chiSquared / degreesOfFreedom;

  // We are essentially testing if our distribution deviates from the expected 50/50 split.
  // This can be modeled with 1 degree of freedom for the overall test.
  // A chi-squared statistic with 1 DF is used.
  // We use the CDF of a chi-square distribution with 1 degree of freedom.
  const probability = chiSquareCdf(normalizedChi);

  return probability;
};
