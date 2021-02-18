const { camelCase, startCase } = require('lodash');

function pascalCase(str) {
  return startCase(camelCase(str)).replace(/ /g, '');
}

const selection = `message Contract {
  string contract_id = 1;
  string draft_id = 2;
  qover.dojo.contracts.v1.Status status = 3;
  string start_date = 4;
  string end_date = 5;
  string purchase_date = 6;
  qover.dojo.contracts.v1.VersionInfo version_info = 7;
  qover.dojo.contracts.v1.ContractSettings settings = 8;
  qover.dojo.common.v1.Refs refs = 9;

  qover.dojo.contracts.v1.Policyholder policyholder = 10;
  Risk risk = 11;
  Terms terms = 12;

  optional repeated qover.dojo.contracts.v1.Coverage coverages = 13;
  qover.dojo.contracts.v1.Coverage total_coverage = 14;

  optional qover.dojo.contracts.v1.Payment payment = 15;
  repeated qover.dojo.common.v1.StringTuple metadata = 16;
  repeated qover.dojo.contracts.v1.DiscountCode discount_codes = 17;
  qover.dojo.contracts.v1.CalculatedField calculated_field = 18;
  repeated qover.dojo.common.v1.StringTuple public_metadata = 19;
  repeated Version previous_versions = 20;
  repeated qover.dojo.contracts.v1.Document documents = 21;
  Version next_version = 22;
  qover.dojo.contracts.v1.Error error = 23;
  repeated qover.dojo.contracts.v1.Attachment attachments = 24;

   string created_at = 25;
  string updated_at = 26;
}`;


const grpcTypesMap = {
  double: 'number',
  float: 'number',
  int32: 'number',
  int64: 'number',
  uint32: 'number',
  uint64: 'number',
  sint32: 'number',
  sint64: 'number',
  fixed32: 'number',
  fixed64: 'number',
  sfixed32: 'number',
  sfixed64: 'number',
  bool: 'boolean',
  string: 'string',
  bytes: 'string',
};

// function createModel(textProperties: string) {
function createModel(textProperties) {
  let rows = textProperties
    .split('\n')
    .map((x) =>
      x
        .replace(/ \=.*$/, '')
        .replace(/[{}]/, '')
        .trim(),
    )
    .filter((x) => x);
  const sortedRows = rows.sort((a, b) => a.split(' ').reverse()[0] < b.split(' ').reverse()[0]? -1 : 1)
  // let properties: Array<string> = [];
  let properties = [];

  let className,
    camelClassName,
    interfaces = '',
    constructors = '',
    getters = '';
    sortedRows.forEach((r) => {
    const row = r.split(' ').reverse();
    const [property, type, ...rules] = row;

    if (type === 'message') {
      closingCurly = true;
      className = pascalCase(property);
      camelClassName = camelCase(property);
    } else {
      let t = Object.keys(grpcTypesMap).includes(type)
        ? grpcTypesMap[type]
        : type.split('.').pop();
      const repeated = rules.includes('repeated');
      if (repeated) {
        t += '[]';
      }
      const optional = rules.includes('optional') ? '?' : '';
      const optionalReturnType = rules.includes('optional')
        ? ' | undefined'
        : '';

      const prop = camelCase(property);
      interfaces += `  private ${prop}${optional}: ${t};\r\n`;
      properties += `  private ${prop}${optional}: ${t};\r\n`;
      constructors += `    this.${prop} = ${camelClassName}.${prop};\r\n`;
      getters += `  public get${pascalCase(
        prop,
      )}(): ${t}${optionalReturnType} {\r\n`;
      getters += `    return this.${prop};\r\n`;
      getters += `  }\r\n\r\n`;
    }
    console.log(r);
  });

  const generatedCode = `
interface ${className}Props {
${interfaces}}

export class ${className} {
${properties}

  constructor(${camelClassName}: ${className}Props) {
${constructors}  }

${getters}}
`;

  return generatedCode;
}

console.log(createModel(selection));
