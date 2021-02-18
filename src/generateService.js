const selection = `export interface ContractService<TContract extends AbstractContract<unknown, unknown>> {
  getDraft(draftId: DraftId): Promise<TContract | null>;
  createDraft(draft: TContract): Promise<TContract>;
  cancelContract(contract: TContract): Promise<TContract>;
  updateDraft(draft: TContract): Promise<TContract>;
  validateDraft(draft: TContract): Promise<ValidationResponse>;
  validateContract(draft: TContract): Promise<ValidationResponse>;
  getPaymentStatus(draftId: DraftId): Promise<DraftPaymentStatus>;
  getContract(contractId: ContractId): Promise<TContract>;
  amendContract(contract: TContract): Promise<TContract>;
  amendPreviewContract(contract: TContract): Promise<TContract>;
}`;

function createService(textProperties) {
  let rows = textProperties
    .split('\n')
    .map((x) => x.replace(/[{};]/, '').trim())
    .filter((x) => x);
  
  const interfaceRow = rows.shift();
  const interfaceMatch = interfaceRow.match(/interface (\w+)(<(.*)>)?/);
  const [,interfaceName,interfaceType] = interfaceMatch;

  const functions = rows.map(r => `  async ${r} {\r\n\r\n  }\r\n\r\n`).join('');

  const generatedCode = `
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ${interfaceName} implements ${interfaceName}${interfaceType ?? ''} {
${functions}}
`;

  return generatedCode;
}

console.log(createService(selection));