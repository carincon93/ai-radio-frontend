export async function retry(fn, {
    retries = 5,
    delay = 2000,
    factor = 2
} = {}) {
    let attempt = 0;

    while (attempt < retries) {
        try {
            return await fn();
        } catch (e) {
            attempt++;
            if (attempt >= retries) throw e;
            await new Promise(r => setTimeout(r, delay * Math.pow(factor, attempt)));
        }
    }
}
