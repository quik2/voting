import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID!
);

export interface Applicant {
  id: string;
  applicant_name: string;
  year: string;
  photo: string;
}

export async function getApplicants(): Promise<Applicant[]> {
  const records = await base(process.env.AIRTABLE_TABLE_NAME!)
    .select()
    .all();

  return records.map((record) => ({
    id: record.id,
    applicant_name: record.get('applicant_name') as string,
    year: record.get('year') as string,
    photo: record.get('photo') as string || '',
  }));
}
