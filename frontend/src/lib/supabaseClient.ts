import { createClient } from '@supabase/supabase-js'
import { ENV } from '../constants/env'
import type { Database } from '../types/database'

const supabase = createClient<Database>(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY)

export default supabase
