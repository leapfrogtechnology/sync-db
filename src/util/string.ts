/**
 * Interpolate a given template string by filling the placeholders with the params.
 *
 * Placeholder syntax:
 *  {{name}}
 *
 * @example
 * interpolate('<div>{{text}}</div>', {text: 'Hello World!'})
 *  => '<div>Hello World!</div>'
 *
 * @param {string} template
 * @param {*} [params={}]
 * @returns {string}
 */
export function interpolate(template: string, params: any = {}): string {
  if (!params || !Object.keys(params)) {
    return template;
  }

  let result = template;

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) {
      continue;
    }

    result = result.replace(new RegExp('{{' + key + '}}', 'g'), `${value}`);
  }

  return result;
}
