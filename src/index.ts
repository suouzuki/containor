/**
 * @module ContainorModule
 * @description Main entry point for the Containor library.
 */

import Containor from './containor.js';
import ContainorArray from './containorArray.js';

/**
 * @memberof module:ContainorModule
 * @type {typeof ContainorArray}
 */
Containor.ContainorArray = ContainorArray;

/**
 * The main Containor class.
 * @default
 */
export default Containor;
export { Containor }

/**
 * ContainorArray class, extends Array with utility methods.
 */
export { ContainorArray };

