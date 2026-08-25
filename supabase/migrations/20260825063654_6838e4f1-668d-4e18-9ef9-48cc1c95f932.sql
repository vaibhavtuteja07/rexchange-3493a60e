CREATE TABLE public.listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'offer',
  description TEXT NOT NULL DEFAULT '',
  poster_name TEXT NOT NULL,
  poster_year TEXT NOT NULL DEFAULT '',
  contact TEXT NOT NULL DEFAULT '',
  exchange_count INT NOT NULL DEFAULT 0,
  trust_tier TEXT NOT NULL DEFAULT 'New',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.listings TO anon, authenticated;
GRANT ALL ON public.listings TO service_role;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "listings public read" ON public.listings FOR SELECT USING (true);
CREATE POLICY "listings public insert" ON public.listings FOR INSERT WITH CHECK (true);

CREATE TABLE public.need_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  body TEXT NOT NULL,
  author_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.need_posts TO anon, authenticated;
GRANT ALL ON public.need_posts TO service_role;
ALTER TABLE public.need_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "need_posts public read" ON public.need_posts FOR SELECT USING (true);
CREATE POLICY "need_posts public insert" ON public.need_posts FOR INSERT WITH CHECK (true);

CREATE TABLE public.need_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.need_posts(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  author_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.need_replies TO anon, authenticated;
GRANT ALL ON public.need_replies TO service_role;
ALTER TABLE public.need_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "need_replies public read" ON public.need_replies FOR SELECT USING (true);
CREATE POLICY "need_replies public insert" ON public.need_replies FOR INSERT WITH CHECK (true);

CREATE TABLE public.watch_keywords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  keyword TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.watch_keywords TO anon, authenticated;
GRANT ALL ON public.watch_keywords TO service_role;
ALTER TABLE public.watch_keywords ENABLE ROW LEVEL SECURITY;
CREATE POLICY "watch public read" ON public.watch_keywords FOR SELECT USING (true);
CREATE POLICY "watch public insert" ON public.watch_keywords FOR INSERT WITH CHECK (true);
CREATE POLICY "watch public delete" ON public.watch_keywords FOR DELETE USING (true);

CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  category TEXT NOT NULL DEFAULT 'Social',
  location TEXT NOT NULL DEFAULT '',
  interested_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.events TO anon, authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events public read" ON public.events FOR SELECT USING (true);
CREATE POLICY "events public insert" ON public.events FOR INSERT WITH CHECK (true);
CREATE POLICY "events public update" ON public.events FOR UPDATE USING (true) WITH CHECK (true);

INSERT INTO public.listings (title, category, type, description, poster_name, poster_year, contact, exchange_count, trust_tier) VALUES
('Casio FX-991EX scientific calculator', 'Item', 'offer', 'Barely used, perfect for exams. Happy to hand over in the library any evening.', 'Ananya Rao', 'CSE, 3rd Year', 'ananya.r@campus.edu', 14, 'Campus Regular'),
('Free Python tutoring, 1 hour slots', 'Service', 'offer', 'I can walk you through loops, functions and basic DSA. Weekends only.', 'Rohit Menon', 'IT, 4th Year', '@rohitm on campus chat', 7, 'Trusted'),
('Complete Thermodynamics notes (Unit 1-5)', 'Notes', 'offer', 'Handwritten, colour coded, includes previous year solved papers.', 'Sneha Iyer', 'Mech, 2nd Year', 'sneha.iyer@campus.edu', 5, 'Trusted'),
('Lending my DSLR for a weekend', 'Lend', 'offer', 'Canon 200D with 50mm lens. Return it charged and clean, that is all I ask.', 'Kabir Shah', 'ECE, 4th Year', '98xxxx1123', 11, 'Campus Regular'),
('Need a lab coat for tomorrow morning', 'Request', 'request', 'Size M, chem lab at 9am. Will return by evening same day.', 'Priya Nair', 'Biotech, 1st Year', 'priya.n@campus.edu', 0, 'New'),
('Looking for Data Structures notes', 'Notes', 'request', 'Specifically trees and graphs. Mid-sem is next week and I am lost.', 'Aditya Kulkarni', 'CSE, 2nd Year', 'aditya.k@campus.edu', 1, 'New'),
('Study lamp, warm light', 'Item', 'offer', 'Graduating, so passing it on. Works fine, small dent on the base.', 'Meera Das', 'Civil, 4th Year', 'meera.das@campus.edu', 9, 'Trusted'),
('Guitar lessons in exchange for maths help', 'Service', 'request', 'I teach you guitar basics, you get me through Linear Algebra. Fair trade?', 'Farhan Qureshi', 'Design, 3rd Year', '@farhanq', 3, 'Trusted'),
('Cycle available to borrow on weekends', 'Lend', 'offer', 'Hostel B parking. Just message a day ahead so I can keep it free.', 'Ishaan Verma', 'EEE, 3rd Year', '97xxxx4420', 16, 'Campus Regular'),
('Need an extension cord for the hackathon', 'Request', 'request', '3-4 socket board, need it Friday to Sunday. Returning it Monday morning.', 'Tanvi Bhat', 'CSE, 1st Year', 'tanvi.b@campus.edu', 0, 'New');

INSERT INTO public.need_posts (body, author_name) VALUES
('Anyone know if the deadline for the minor project abstract got pushed? Faculty said something in class but I missed it.', 'Nikhil P'),
('Need help setting up CUDA on Ubuntu. Been stuck two days. Will buy coffee.', 'Riya S'),
('Looking for two people to join a robotics club team for the intercollege event next month.', 'Arjun M');

INSERT INTO public.events (title, event_date, category, location, interested_count) VALUES
('RoboWars Intercollege Qualifiers', CURRENT_DATE + 6, 'Robotics', 'Central Workshop', 42),
('Resume Clinic with Alumni Panel', CURRENT_DATE + 11, 'Career', 'Seminar Hall 2', 87),
('Open Mic Night', CURRENT_DATE + 3, 'Social', 'Amphitheatre', 130),
('Intro to Embedded Systems Workshop', CURRENT_DATE + 18, 'Robotics', 'Lab Block C', 25);