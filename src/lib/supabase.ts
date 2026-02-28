import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lpcpporrmoxgaxnxejol.supabase.co';
const SUPABASE_KEY = 'sb_publishable_4KkjQTEG-pKRaO95dwsgpA_eL1TBJPD';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
