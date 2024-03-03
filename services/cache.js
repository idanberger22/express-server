let cache = {}
setInterval(() => { cache = {} }, 1000 * 60 * 2)

function setCache(key, value) {
    cache[key] = value
}

module.exports = { cache, setCache }

//showsForHome : handle-shows/get-shows