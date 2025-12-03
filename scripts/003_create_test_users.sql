-- Create test user dev@teste.com
-- Password: MovimentAi

-- Insert into auth.users (Supabase auth system)
-- Note: This should be run through Supabase SQL editor or auth.signUp() method
-- For development, you can create this user through the Supabase Dashboard > Authentication > Users

-- Create profile for dev@teste.com
-- First, you need to sign up this user through the app or Supabase Dashboard
-- Then run this to complete the profile:

INSERT INTO profiles (
  id,
  email,
  name,
  onboarding_completed,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'dev@teste.com'),
  'dev@teste.com',
  'Developer',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = 'Developer',
  onboarding_completed = true,
  updated_at = NOW();

-- Create default habits for dev user
INSERT INTO habits (
  user_id,
  name,
  completed,
  created_at
) VALUES 
  ((SELECT id FROM auth.users WHERE email = 'dev@teste.com'), 'Beber água', false, NOW()),
  ((SELECT id FROM auth.users WHERE email = 'dev@teste.com'), 'Dormir bem', false, NOW()),
  ((SELECT id FROM auth.users WHERE email = 'dev@teste.com'), 'Fazer treino', false, NOW()),
  ((SELECT id FROM auth.users WHERE email = 'dev@teste.com'), 'Comer saudável', false, NOW())
ON CONFLICT DO NOTHING;

-- Create default water intake for dev user
INSERT INTO water_intake (
  user_id,
  date,
  glasses,
  goal,
  created_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'dev@teste.com'),
  CURRENT_DATE,
  0,
  8,
  NOW()
) ON CONFLICT (user_id, date) DO NOTHING;
