
/** @type {(ns:NS, name:string, ...args:any[]) => number} */
export const task = (ns, name, ...args) => ns.run(`t_${name}.js`, 1, ...args) || ns.tprint(`ERROR gtask ${name} ${args} failed`) || 0;
