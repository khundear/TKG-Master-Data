// Register every module's English catalog once. Thai is the key and the default locale.
import { registerCatalog } from '@tkg/i18n';
import materialsEn from '@tkg/materials/i18n/en.json';
import skuEn from '@tkg/sku-selling/i18n/en.json';
import webEn from './en.json';

registerCatalog(webEn);
registerCatalog(materialsEn);
registerCatalog(skuEn);

export { _t } from '@tkg/i18n';
