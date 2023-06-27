const fetch = require('node-fetch')
const fetchSSE = require('./fetchSSE')

module.exports = class Api2d {
    constructor(key = null, apiBaseUrl = null, timeout = 60000) {
        this.key = key
        this.apiBaseUrl = apiBaseUrl || (key && key.startsWith('fk') ? 'https://openai.api2d.net' : 'https://api.openai.com')
        this.timeout = timeout
        this.controller = new AbortController()
    }

    // 设置API密钥
    setKey(key) {
        this.key = key
    }

    // 设置API地址
    setApiBaseUrl(apiBaseUrl) {
        this.apiBaseUrl = apiBaseUrl
    }

    // 设置超时时间
    setTimeout(timeout) {
        this.timeout = timeout
    }

    // 终止请求
    abort() {
        this.controller.abort()
        this.controller = new AbortController()
    }

    // 发送对话完成请求
    async completion(options) {
        // 拼接目标URL
        const url = this.apiBaseUrl + '/v1/chat/completions'

        // 拼接headers
        const headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + this.key
        }

        const { onMessage, onEnd, model, noCache, ...restOptions } = options

        if (noCache) headers['x-api2d-no-cache'] = 1

        if (restOptions.stream && onMessage) {
            return new Promise(async (resolve, reject) => {
                try {
                    let chars = ''

                    const timeout_handle = setTimeout(() => {
                        this.controller.abort()
                        this.controller = new AbortController()
                        reject(new Error(`[408]:Timeout by ${this.timeout} ms`))
                    }, this.timeout);

                    const response = await fetchSSE(url, {
                        signal: this.controller.signal,
                        method: 'POST',
                        openWhenHidden: true,
                        fetch: fetch,
                        headers: { ...headers, Accept: 'text/event-stream' },
                        body: JSON.stringify({ ...restOptions, model: model || 'gpt-3.5-turbo' }),
                        async onopen(response) {
                            if (response.status != 200) {
                                throw new Error(`[${response.status}]:${response.statusText}`);
                            }
                        },
                        onmessage: (data) => {
                            if (timeout_handle) {
                                clearTimeout(timeout_handle)
                            }

                            if (data == '[DONE]') {
                                if (onEnd) {
                                    onEnd(chars)
                                }
                                resolve(chars)
                            } else {
                                const event = JSON.parse(data)

                                if (event.error) {
                                    throw new Error(event.error.message)
                                } else {
                                    const char = event.choices[0].delta.content
                                    if (char) {
                                        chars += char

                                        if (onMessage) {
                                            onMessage(chars, char)
                                        }
                                    }
                                }
                            }
                        },
                        onerror: (error) => {
                            let error_string = String(error)
                            if (error_string && error_string.match(/\[(\d+)\]/)) {
                                const matchs = error_string.match(/\[(\d+)\]/)
                                error_string = `[${matchs[1]}]:${error_string}`
                            }
                            throw new Error(error_string)
                        }
                    }, global.fetch || fetch)
                } catch (error) {
                    reject(error)
                }
            })
        } else {
            // 使用 fetch 发送请求
            const timeout_handle = setTimeout(() => {
                this.controller.abort();
                this.controller = new AbortController();
            }, this.timeout);
            const response = await fetch(url, {
                signal: this.controller.signal,
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ ...restOptions, model: model || 'gpt-3.5-turbo' })
            });
            const ret = await response.json()
            clearTimeout(timeout_handle)

            return ret;
        }
    }
}