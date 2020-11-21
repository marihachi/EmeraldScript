import $, { StringContext } from 'cafy';

export type OptionalPropDef = {
	name: string;
	required: false;
	validator: StringContext;
	defaultValue: any;
};

export type RequiredPropDef = {
	name: string;
	required: true;
	validator: StringContext;
};

export type PropDef
	= OptionalPropDef | RequiredPropDef;

export const propDefs = {
	section: [
		{ name: 'title', required: true, validator: $.str }
	] as PropDef[],
	inputNumber: [
		{ name: 'variable', required: true, validator: $.str.min(1) },
		{ name: 'default', required: true, validator: $.str.match(/^[0-9]+$/) },
		{ name: 'title', required: false, validator: $.str, defaultValue: '' }
	] as PropDef[]
};
