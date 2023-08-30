// Helper function to generate a random 6-digit access code as a string
export const generateAccessCode = function generateAccessCode() {
    const min = 100000;
    const max = 999999;
    const randomCode = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomCode.toString(); // Convert the code to a string
}