import * as fs from 'fs';
import * as path from 'path';
import BaseBuilder from './base';
import * as MergeTree from 'broccoli-merge-trees';
import Concat from '../trees/concat';
import * as Funnel from 'broccoli-funnel';
import { Tree } from 'broccoli';
import { template } from 'lodash';

const bundleOpen = template(fs.readFileSync(path.join(__dirname, '..', 'templates', 'bundle-open.ejs'), 'utf-8'));
const bundleClose = fs.readFileSync(path.join(__dirname, '..', 'templates', 'bundle-close.ejs'), 'utf-8');

export default class AppBuilder extends BaseBuilder {

  bundle(tree: Tree): Tree {
    tree = new Concat(tree, {
      wrapAsModules: true,
      outputFile: `app.runtime.js`,
      baseDir: this.dir
    });
    let addonBundles = this.addons.map((addon) => {
      return new Funnel(addon.toTree(), {
        files: [
          `addon.runtime.js`,
          `addon.runtime.map`
        ]
      });
    });
    tree = new MergeTree(addonBundles.concat(tree), { annotation: 'merge app and addon runtimes' });
    tree = new Concat(tree, {
      header: bundleOpen({ pkgName: this.pkg.name, version: this.pkg.version }),
      footer: bundleClose,
      outputFile: `bundle.runtime.js`
    });
    return tree;
  }

}
