import { inflateRawSync } from 'node:zlib';

export type SalaryBenchmarkKey = 'central-london' | 'west-london' | 'edinburgh';
export type SalaryRole = 'all-employees' | 'software-engineer';
export type SalaryAgeBand = '18-21' | '22-29' | '30-39' | '40-49' | '50-59' | '60+';

export type SalaryBenchmark = {
  role: SalaryRole;
  key: SalaryBenchmarkKey;
  label: string;
  locality: string;
  areaCode: string;
  annualMedian: number | null;
  sourceSheet: string;
  sourceDataset: string;
  notes: string;
};

export type SalaryAgeOverlay = {
  role: SalaryRole;
  ageBand: SalaryAgeBand;
  label: string;
  comparisonGroup: string;
  annualMedian: number | null;
  sourceSheet: string;
  sourceDataset: string;
  notes: string;
};

type ZipEntry = {
  compressionMethod: number;
  compressedData: Buffer;
};

type Table7Target = {
  key: SalaryBenchmarkKey;
  label: string;
  locality: string;
  areaCode: string;
  notes: string;
};

type Table15Target = {
  key: SalaryBenchmarkKey;
  label: string;
  locality: string;
  areaCode: string;
  description: string;
  occupationCode: string;
  notes: string;
};

type AgeBandTarget = {
  ageBand: SalaryAgeBand;
  label: string;
};

const TABLE_6_FULL_TIME_SHEET = 'Full-Time';
const TABLE_7_FULL_TIME_SHEET = 'Full-Time';
const TABLE_15_FULL_TIME_SHEET = 'Full-Time';
const TABLE_20_FULL_TIME_SHEET = 'Full-Time';
const SOFTWARE_ENGINEER_OCCUPATION_CODE = '2134';
const SOFTWARE_ENGINEER_AGE_OVERLAY_OCCUPATION_CODE = '21';
const SOFTWARE_ENGINEER_AGE_OVERLAY_OCCUPATION_LABEL =
  'Science, research, engineering and technology professionals';
const TABLE_6_ANNUAL_PAY_WORKBOOK_PATTERN = /Table 6\.7a\s+Annual pay - Gross .*\.xlsx$/i;
const TABLE_7_ANNUAL_PAY_WORKBOOK_PATTERN = /Table 7\.7a\s+Annual pay - Gross .*\.xlsx$/i;
const TABLE_15_ANNUAL_PAY_WORKBOOK_PATTERN =
  /Table 15 \(4\)\.7a\s+Annual pay - Gross .*\.xlsx$/i;
const TABLE_20_ANNUAL_PAY_WORKBOOK_PATTERN = /Table 20\.7a\s+Annual pay - Gross .*\.xlsx$/i;

const AGE_BAND_TARGETS: AgeBandTarget[] = [
  { ageBand: '18-21', label: '18-21' },
  { ageBand: '22-29', label: '22-29' },
  { ageBand: '30-39', label: '30-39' },
  { ageBand: '40-49', label: '40-49' },
  { ageBand: '50-59', label: '50-59' },
  { ageBand: '60+', label: '60+' },
];

const TABLE_7_TARGETS: Table7Target[] = [
  {
    key: 'central-london',
    label: 'Central London',
    locality: 'Westminster',
    areaCode: 'E09000033',
    notes: 'Representative full-time work-based median for Westminster.',
  },
  {
    key: 'west-london',
    label: 'West London',
    locality: 'Hounslow',
    areaCode: 'E09000018',
    notes: 'Representative full-time work-based median for Hounslow.',
  },
  {
    key: 'edinburgh',
    label: 'Edinburgh',
    locality: 'City of Edinburgh',
    areaCode: 'S12000036',
    notes: 'Representative full-time work-based median for the City of Edinburgh.',
  },
];

const TABLE_15_TARGETS: Table15Target[] = [
  {
    key: 'central-london',
    label: 'Central London',
    locality: 'London',
    areaCode: 'E12000007',
    description: 'London, Programmers and software development professionals',
    occupationCode: SOFTWARE_ENGINEER_OCCUPATION_CODE,
    notes: 'Representative full-time software-development professional median for the London region.',
  },
  {
    key: 'west-london',
    label: 'West London',
    locality: 'London',
    areaCode: 'E12000007',
    description: 'London, Programmers and software development professionals',
    occupationCode: SOFTWARE_ENGINEER_OCCUPATION_CODE,
    notes: 'Representative full-time software-development professional median for the London region.',
  },
  {
    key: 'edinburgh',
    label: 'Scotland',
    locality: 'Scotland',
    areaCode: 'S92000003',
    description: 'Scotland, Programmers and software development professionals',
    occupationCode: SOFTWARE_ENGINEER_OCCUPATION_CODE,
    notes: 'Representative full-time software-development professional median for the Scotland region.',
  },
];

export const SALARY_BENCHMARK_FALLBACKS: SalaryBenchmark[] = [
  {
    role: 'all-employees',
    key: 'central-london',
    label: 'Central London',
    locality: 'Westminster',
    areaCode: 'E09000033',
    annualMedian: 53923,
    sourceSheet: TABLE_7_FULL_TIME_SHEET,
    sourceDataset: 'ASHE Table 7',
    notes: 'Representative full-time work-based median for Westminster.',
  },
  {
    role: 'all-employees',
    key: 'west-london',
    label: 'West London',
    locality: 'Hounslow',
    areaCode: 'E09000018',
    annualMedian: 43068,
    sourceSheet: TABLE_7_FULL_TIME_SHEET,
    sourceDataset: 'ASHE Table 7',
    notes: 'Representative full-time work-based median for Hounslow.',
  },
  {
    role: 'all-employees',
    key: 'edinburgh',
    label: 'Edinburgh',
    locality: 'City of Edinburgh',
    areaCode: 'S12000036',
    annualMedian: 43715,
    sourceSheet: TABLE_7_FULL_TIME_SHEET,
    sourceDataset: 'ASHE Table 7',
    notes: 'Representative full-time work-based median for the City of Edinburgh.',
  },
  {
    role: 'software-engineer',
    key: 'central-london',
    label: 'Central London',
    locality: 'London',
    areaCode: 'E12000007',
    annualMedian: 75296,
    sourceSheet: TABLE_15_FULL_TIME_SHEET,
    sourceDataset: 'ASHE Table 15',
    notes: 'Representative full-time software-development professional median for the London region.',
  },
  {
    role: 'software-engineer',
    key: 'west-london',
    label: 'West London',
    locality: 'London',
    areaCode: 'E12000007',
    annualMedian: 75296,
    sourceSheet: TABLE_15_FULL_TIME_SHEET,
    sourceDataset: 'ASHE Table 15',
    notes: 'Representative full-time software-development professional median for the London region.',
  },
  {
    role: 'software-engineer',
    key: 'edinburgh',
    label: 'Scotland',
    locality: 'Scotland',
    areaCode: 'S92000003',
    annualMedian: 48930,
    sourceSheet: TABLE_15_FULL_TIME_SHEET,
    sourceDataset: 'ASHE Table 15',
    notes: 'Representative full-time software-development professional median for the Scotland region.',
  },
];

export const SALARY_AGE_OVERLAY_FALLBACKS: SalaryAgeOverlay[] = [
  {
    role: 'all-employees',
    ageBand: '18-21',
    label: '18-21',
    comparisonGroup: 'UK full-time all employees',
    annualMedian: 23596,
    sourceSheet: TABLE_6_FULL_TIME_SHEET,
    sourceDataset: 'ASHE Table 6',
    notes: 'UK-wide full-time all-employees median for this age band.',
  },
  {
    role: 'all-employees',
    ageBand: '22-29',
    label: '22-29',
    comparisonGroup: 'UK full-time all employees',
    annualMedian: 32347,
    sourceSheet: TABLE_6_FULL_TIME_SHEET,
    sourceDataset: 'ASHE Table 6',
    notes: 'UK-wide full-time all-employees median for this age band.',
  },
  {
    role: 'all-employees',
    ageBand: '30-39',
    label: '30-39',
    comparisonGroup: 'UK full-time all employees',
    annualMedian: 40668,
    sourceSheet: TABLE_6_FULL_TIME_SHEET,
    sourceDataset: 'ASHE Table 6',
    notes: 'UK-wide full-time all-employees median for this age band.',
  },
  {
    role: 'all-employees',
    ageBand: '40-49',
    label: '40-49',
    comparisonGroup: 'UK full-time all employees',
    annualMedian: 44244,
    sourceSheet: TABLE_6_FULL_TIME_SHEET,
    sourceDataset: 'ASHE Table 6',
    notes: 'UK-wide full-time all-employees median for this age band.',
  },
  {
    role: 'all-employees',
    ageBand: '50-59',
    label: '50-59',
    comparisonGroup: 'UK full-time all employees',
    annualMedian: 41866,
    sourceSheet: TABLE_6_FULL_TIME_SHEET,
    sourceDataset: 'ASHE Table 6',
    notes: 'UK-wide full-time all-employees median for this age band.',
  },
  {
    role: 'all-employees',
    ageBand: '60+',
    label: '60+',
    comparisonGroup: 'UK full-time all employees',
    annualMedian: 36467,
    sourceSheet: TABLE_6_FULL_TIME_SHEET,
    sourceDataset: 'ASHE Table 6',
    notes: 'UK-wide full-time all-employees median for this age band.',
  },
  {
    role: 'software-engineer',
    ageBand: '18-21',
    label: '18-21',
    comparisonGroup: SOFTWARE_ENGINEER_AGE_OVERLAY_OCCUPATION_LABEL,
    annualMedian: 24073,
    sourceSheet: TABLE_20_FULL_TIME_SHEET,
    sourceDataset: 'ASHE Table 20',
    notes:
      'Nearest published age-banded occupation cut for the software-engineer path: UK-wide science, research, engineering and technology professionals.',
  },
  {
    role: 'software-engineer',
    ageBand: '22-29',
    label: '22-29',
    comparisonGroup: SOFTWARE_ENGINEER_AGE_OVERLAY_OCCUPATION_LABEL,
    annualMedian: 38801,
    sourceSheet: TABLE_20_FULL_TIME_SHEET,
    sourceDataset: 'ASHE Table 20',
    notes:
      'Nearest published age-banded occupation cut for the software-engineer path: UK-wide science, research, engineering and technology professionals.',
  },
  {
    role: 'software-engineer',
    ageBand: '30-39',
    label: '30-39',
    comparisonGroup: SOFTWARE_ENGINEER_AGE_OVERLAY_OCCUPATION_LABEL,
    annualMedian: 52081,
    sourceSheet: TABLE_20_FULL_TIME_SHEET,
    sourceDataset: 'ASHE Table 20',
    notes:
      'Nearest published age-banded occupation cut for the software-engineer path: UK-wide science, research, engineering and technology professionals.',
  },
  {
    role: 'software-engineer',
    ageBand: '40-49',
    label: '40-49',
    comparisonGroup: SOFTWARE_ENGINEER_AGE_OVERLAY_OCCUPATION_LABEL,
    annualMedian: 57110,
    sourceSheet: TABLE_20_FULL_TIME_SHEET,
    sourceDataset: 'ASHE Table 20',
    notes:
      'Nearest published age-banded occupation cut for the software-engineer path: UK-wide science, research, engineering and technology professionals.',
  },
  {
    role: 'software-engineer',
    ageBand: '50-59',
    label: '50-59',
    comparisonGroup: SOFTWARE_ENGINEER_AGE_OVERLAY_OCCUPATION_LABEL,
    annualMedian: 58097,
    sourceSheet: TABLE_20_FULL_TIME_SHEET,
    sourceDataset: 'ASHE Table 20',
    notes:
      'Nearest published age-banded occupation cut for the software-engineer path: UK-wide science, research, engineering and technology professionals.',
  },
  {
    role: 'software-engineer',
    ageBand: '60+',
    label: '60+',
    comparisonGroup: SOFTWARE_ENGINEER_AGE_OVERLAY_OCCUPATION_LABEL,
    annualMedian: 53777,
    sourceSheet: TABLE_20_FULL_TIME_SHEET,
    sourceDataset: 'ASHE Table 20',
    notes:
      'Nearest published age-banded occupation cut for the software-engineer path: UK-wide science, research, engineering and technology professionals.',
  },
];

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function parseZipEntries(buffer: Buffer): Map<string, ZipEntry> {
  const entries = new Map<string, ZipEntry>();
  const eocdSignature = 0x06054b50;
  const centralDirectorySignature = 0x02014b50;
  const localFileSignature = 0x04034b50;

  let eocdOffset = -1;
  for (let offset = buffer.length - 22; offset >= Math.max(0, buffer.length - 65557); offset -= 1) {
    if (buffer.readUInt32LE(offset) === eocdSignature) {
      eocdOffset = offset;
      break;
    }
  }

  if (eocdOffset === -1) {
    throw new Error('Could not find ZIP end of central directory');
  }

  const totalEntries = buffer.readUInt16LE(eocdOffset + 10);
  let centralDirectoryOffset = buffer.readUInt32LE(eocdOffset + 16);

  for (let index = 0; index < totalEntries; index += 1) {
    if (buffer.readUInt32LE(centralDirectoryOffset) !== centralDirectorySignature) {
      throw new Error('Invalid ZIP central directory entry');
    }

    const compressionMethod = buffer.readUInt16LE(centralDirectoryOffset + 10);
    const compressedSize = buffer.readUInt32LE(centralDirectoryOffset + 20);
    const fileNameLength = buffer.readUInt16LE(centralDirectoryOffset + 28);
    const extraFieldLength = buffer.readUInt16LE(centralDirectoryOffset + 30);
    const fileCommentLength = buffer.readUInt16LE(centralDirectoryOffset + 32);
    const localHeaderOffset = buffer.readUInt32LE(centralDirectoryOffset + 42);
    const fileName = buffer
      .slice(centralDirectoryOffset + 46, centralDirectoryOffset + 46 + fileNameLength)
      .toString('utf8');

    if (buffer.readUInt32LE(localHeaderOffset) !== localFileSignature) {
      throw new Error(`Invalid local ZIP header for ${fileName}`);
    }

    const localFileNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
    const localExtraFieldLength = buffer.readUInt16LE(localHeaderOffset + 28);
    const dataOffset = localHeaderOffset + 30 + localFileNameLength + localExtraFieldLength;
    const compressedData = buffer.slice(dataOffset, dataOffset + compressedSize);

    entries.set(fileName, {
      compressionMethod,
      compressedData,
    });

    centralDirectoryOffset += 46 + fileNameLength + extraFieldLength + fileCommentLength;
  }

  return entries;
}

function unzipEntry(entries: Map<string, ZipEntry>, name: string) {
  const entry = entries.get(name);
  if (!entry) {
    throw new Error(`Missing ZIP entry: ${name}`);
  }

  if (entry.compressionMethod === 0) {
    return entry.compressedData;
  }

  if (entry.compressionMethod === 8) {
    return inflateRawSync(entry.compressedData);
  }

  throw new Error(`Unsupported ZIP compression method ${entry.compressionMethod} for ${name}`);
}

function maybeUnzipEntry(entries: Map<string, ZipEntry>, name: string) {
  const entry = entries.get(name);
  if (!entry) {
    return null;
  }

  if (entry.compressionMethod === 0) {
    return entry.compressedData;
  }

  if (entry.compressionMethod === 8) {
    return inflateRawSync(entry.compressedData);
  }

  throw new Error(`Unsupported ZIP compression method ${entry.compressionMethod} for ${name}`);
}

function parseSharedStrings(xml: string) {
  const strings: string[] = [];
  const itemPattern = /<si\b[^>]*>([\s\S]*?)<\/si>/g;
  let itemMatch = itemPattern.exec(xml);

  while (itemMatch) {
    const textPattern = /<t\b[^>]*>([\s\S]*?)<\/t>/g;
    let value = '';
    let textMatch = textPattern.exec(itemMatch[1]);

    while (textMatch) {
      value += decodeXml(textMatch[1]);
      textMatch = textPattern.exec(itemMatch[1]);
    }

    strings.push(value);
    itemMatch = itemPattern.exec(xml);
  }

  return strings;
}

function findSheetPath(entries: Map<string, ZipEntry>, sheetName: string) {
  const workbookXml = unzipEntry(entries, 'xl/workbook.xml').toString('utf8');
  const relsXml = unzipEntry(entries, 'xl/_rels/workbook.xml.rels').toString('utf8');
  const sheetPattern = /<sheet\b[^>]*name="([^"]+)"[^>]*r:id="([^"]+)"[^>]*\/?>/g;
  const relPattern = /<Relationship\b[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"[^>]*\/?>/g;
  const relationships = new Map<string, string>();

  let relMatch = relPattern.exec(relsXml);
  while (relMatch) {
    relationships.set(relMatch[1], relMatch[2]);
    relMatch = relPattern.exec(relsXml);
  }

  let sheetMatch = sheetPattern.exec(workbookXml);
  while (sheetMatch) {
    const [, currentName, relationshipId] = sheetMatch;
    if (currentName === sheetName) {
      const target = relationships.get(relationshipId);
      if (!target) {
        throw new Error(`Missing worksheet relationship for ${sheetName}`);
      }
      return `xl/${target.replace(/^\.\//, '').replace(/^\/?xl\//, '')}`;
    }
    sheetMatch = sheetPattern.exec(workbookXml);
  }

  throw new Error(`Could not find worksheet ${sheetName}`);
}

function parseSheetRows(xml: string, sharedStrings: string[]) {
  const rows: Array<Record<string, string>> = [];
  const rowPattern = /<row\b[^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g;
  let rowMatch = rowPattern.exec(xml);

  while (rowMatch) {
    const row: Record<string, string> = {};
    const cellPattern = /<c\b[^>]*r="([A-Z]+)\d+"([^>]*)>([\s\S]*?)<\/c>/g;
    let cellMatch = cellPattern.exec(rowMatch[2]);

    while (cellMatch) {
      const [, column, rawAttrs, innerXml] = cellMatch;
      const typeMatch = rawAttrs.match(/\bt="([^"]+)"/);
      const valueMatch = innerXml.match(/<v>([\s\S]*?)<\/v>/);
      const inlineMatch = innerXml.match(/<t\b[^>]*>([\s\S]*?)<\/t>/);
      let value = '';

      if (valueMatch) {
        value = decodeXml(valueMatch[1]);
      } else if (inlineMatch) {
        value = decodeXml(inlineMatch[1]);
      }

      if (typeMatch?.[1] === 's' && value) {
        value = sharedStrings[Number(value)] ?? '';
      }

      row[column] = value;
      cellMatch = cellPattern.exec(rowMatch[2]);
    }

    rows.push(row);
    rowMatch = rowPattern.exec(xml);
  }

  return rows;
}

function parseWorkbookRows(zipBuffer: Buffer, sheetName: string) {
  if (zipBuffer.length < 4 || zipBuffer.readUInt32LE(0) !== 0x04034b50) {
    throw new Error('ASHE download was not a valid XLSX zip archive');
  }

  const entries = parseZipEntries(zipBuffer);
  const sharedStringsBuffer = maybeUnzipEntry(entries, 'xl/sharedStrings.xml');
  const sharedStrings = sharedStringsBuffer
    ? parseSharedStrings(sharedStringsBuffer.toString('utf8'))
    : [];
  const sheetPath = findSheetPath(entries, sheetName);
  const sheetXml = unzipEntry(entries, sheetPath).toString('utf8');
  return parseSheetRows(sheetXml, sharedStrings);
}

function resolveWorkbookZipBuffer(zipBuffer: Buffer, workbookPattern: RegExp) {
  const directEntries = parseZipEntries(zipBuffer);
  if (directEntries.has('xl/workbook.xml')) {
    return zipBuffer;
  }

  const workbookEntryName = Array.from(directEntries.keys()).find((name) =>
    workbookPattern.test(name)
  );

  if (!workbookEntryName) {
    throw new Error(`Could not find nested ASHE workbook matching ${workbookPattern}`);
  }

  return unzipEntry(directEntries, workbookEntryName);
}

export function extractSalaryBenchmarksFromAsheTable7Zip(zipBuffer: Buffer): SalaryBenchmark[] {
  const workbookZipBuffer = resolveWorkbookZipBuffer(zipBuffer, TABLE_7_ANNUAL_PAY_WORKBOOK_PATTERN);
  const rows = parseWorkbookRows(workbookZipBuffer, TABLE_7_FULL_TIME_SHEET);

  return TABLE_7_TARGETS.map((target) => {
    const row =
      rows.find((candidate) => candidate.B === target.areaCode) ??
      rows.find((candidate) => candidate.A?.trim() === target.locality);

    if (!row) {
      throw new Error(`Missing ASHE Table 7 benchmark row for ${target.locality}`);
    }

    const annualMedian = Number(row.D);
    if (!Number.isFinite(annualMedian)) {
      throw new Error(`Invalid ASHE Table 7 median for ${target.locality}`);
    }

    return {
      role: 'all-employees' as const,
      ...target,
      annualMedian,
      sourceSheet: TABLE_7_FULL_TIME_SHEET,
      sourceDataset: 'ASHE Table 7',
    };
  });
}

export function extractSalaryBenchmarksFromAsheTable15Zip(zipBuffer: Buffer): SalaryBenchmark[] {
  const workbookZipBuffer = resolveWorkbookZipBuffer(
    zipBuffer,
    TABLE_15_ANNUAL_PAY_WORKBOOK_PATTERN
  );
  const rows = parseWorkbookRows(workbookZipBuffer, TABLE_15_FULL_TIME_SHEET);

  return TABLE_15_TARGETS.map((target) => {
    const row =
      rows.find(
        (candidate) =>
          candidate.B === target.occupationCode && candidate.A?.includes(target.description)
      ) ??
      rows.find(
        (candidate) =>
          candidate.B === target.occupationCode && candidate.A?.includes(target.locality)
      );

    if (!row) {
      throw new Error(`Missing ASHE Table 15 benchmark row for ${target.locality}`);
    }

    const annualMedian = Number(row.D);
    if (!Number.isFinite(annualMedian)) {
      throw new Error(`Invalid ASHE Table 15 median for ${target.locality}`);
    }

    return {
      role: 'software-engineer' as const,
      key: target.key,
      label: target.label,
      locality: target.locality,
      areaCode: target.areaCode,
      annualMedian,
      sourceSheet: TABLE_15_FULL_TIME_SHEET,
      sourceDataset: 'ASHE Table 15',
      notes: target.notes,
    };
  });
}

export function extractSalaryAgeOverlaysFromAsheTable6Zip(zipBuffer: Buffer): SalaryAgeOverlay[] {
  const workbookZipBuffer = resolveWorkbookZipBuffer(zipBuffer, TABLE_6_ANNUAL_PAY_WORKBOOK_PATTERN);
  const rows = parseWorkbookRows(workbookZipBuffer, TABLE_6_FULL_TIME_SHEET);

  return AGE_BAND_TARGETS.map((target) => {
    const row = rows.find((candidate) => normalizeWhitespace(candidate.A ?? '') === target.label);

    if (!row) {
      throw new Error(`Missing ASHE Table 6 age-band row for ${target.label}`);
    }

    const annualMedian = Number(row.D);
    if (!Number.isFinite(annualMedian)) {
      throw new Error(`Invalid ASHE Table 6 median for ${target.label}`);
    }

    return {
      role: 'all-employees' as const,
      ageBand: target.ageBand,
      label: target.label,
      comparisonGroup: 'UK full-time all employees',
      annualMedian,
      sourceSheet: TABLE_6_FULL_TIME_SHEET,
      sourceDataset: 'ASHE Table 6',
      notes: 'UK-wide full-time all-employees median for this age band.',
    };
  });
}

export function extractSalaryAgeOverlaysFromAsheTable20Zip(zipBuffer: Buffer): SalaryAgeOverlay[] {
  const workbookZipBuffer = resolveWorkbookZipBuffer(zipBuffer, TABLE_20_ANNUAL_PAY_WORKBOOK_PATTERN);
  const rows = parseWorkbookRows(workbookZipBuffer, TABLE_20_FULL_TIME_SHEET);

  return AGE_BAND_TARGETS.map((target) => {
    const row = rows.find((candidate) => {
      const description = normalizeWhitespace(candidate.A ?? '');
      return (
        candidate.B === SOFTWARE_ENGINEER_AGE_OVERLAY_OCCUPATION_CODE &&
        description.startsWith(target.label) &&
        description.includes(SOFTWARE_ENGINEER_AGE_OVERLAY_OCCUPATION_LABEL)
      );
    });

    if (!row) {
      throw new Error(`Missing ASHE Table 20 age-band row for ${target.label}`);
    }

    const annualMedian = Number(row.D);
    if (!Number.isFinite(annualMedian)) {
      throw new Error(`Invalid ASHE Table 20 median for ${target.label}`);
    }

    return {
      role: 'software-engineer' as const,
      ageBand: target.ageBand,
      label: target.label,
      comparisonGroup: SOFTWARE_ENGINEER_AGE_OVERLAY_OCCUPATION_LABEL,
      annualMedian,
      sourceSheet: TABLE_20_FULL_TIME_SHEET,
      sourceDataset: 'ASHE Table 20',
      notes:
        'Nearest published age-banded occupation cut for the software-engineer path: UK-wide science, research, engineering and technology professionals.',
    };
  });
}
