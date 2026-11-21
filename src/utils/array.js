export const sum = (items, selector) => items.reduce((total, item) => total + selector(item), 0)
