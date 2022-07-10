import * as cryptojs from 'crypto-js'

interface IQueryParam {
  key: string
  value: string
}

/**
 * Верифицирует параметры запуска.
 * @param searchOrParsedUrlQuery
 * @param {string} secretKey
 * @returns {boolean}
 */
export const authenticateVKParams = (
  searchOrParsedUrlQuery: string,
): boolean => {
  const secretKey = import.meta.env.VITE_PROTECTED_KEY
  let sign: string | undefined
  const queryParams: IQueryParam[] = []

  /**
   * Функция, которая обрабатывает входящий query-параметр. В случае передачи
   * параметра, отвечающего за подпись, подменяет "sign". В случае встречи
   * корректного в контексте подписи параметра добавляет его в массив
   * известных параметров.
   * @param key
   * @param value
   */
  const processQueryParam = (key: string, value: any) => {
    if (typeof value === 'string') {
      if (key === 'sign') {
        sign = value
      } else if (key.startsWith('vk_')) {
        queryParams.push({ key, value })
      }
    }
  }

  const formattedSearch = searchOrParsedUrlQuery.startsWith('?')
    ? searchOrParsedUrlQuery.slice(1)
    : searchOrParsedUrlQuery

  // Пытаемся спарсить строку как query-параметр.
  for (const param of formattedSearch.split('&')) {
    const [key, value] = param.split('=')
    processQueryParam(key, value)
  }

  // Обрабатываем исключительный случай, когда не найдена ни подпись в параметрах,
  // ни один параметр, начинающийся с "vk_", дабы избежать
  // излишней нагрузки, образующейся в процессе работы дальнейшего кода.
  if (!sign || queryParams.length === 0) {
    return false
  }
  // Снова создаём query в виде строки из уже отфильтрованных параметров.
  const queryString = queryParams
    // Сортируем ключи в порядке возрастания.
    .sort((a, b) => a.key.localeCompare(b.key))
    // Воссоздаем новый query в виде строки.
    .reduce<string>((acc, { key, value }, idx) => {
      return (
        acc + (idx === 0 ? '' : '&') + `${key}=${encodeURIComponent(value)}`
      )
    }, '')

  // Создаём хеш получившейся строки на основе секретного ключа.
  const paramsHash = cryptojs
    .HmacSHA256(queryString, secretKey)
    .toString(cryptojs.enc.Base64)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=$/, '')

  //console.log(paramsHash, ' <===?> ', sign, ' << sc = ', secretKey)

  return paramsHash === sign
}
