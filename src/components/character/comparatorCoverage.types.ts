import type { Character, Item } from '../../types';
import type { FieldPolicyMap } from './comparatorPolicy';
import { characterFieldPolicy } from './characterSheetFormState';
import { itemFieldPolicy } from './itemSheetFormState';

const characterPolicyCoverage: FieldPolicyMap<Character> = characterFieldPolicy;
const itemPolicyCoverage: FieldPolicyMap<Item> = itemFieldPolicy;

void characterPolicyCoverage;
void itemPolicyCoverage;
