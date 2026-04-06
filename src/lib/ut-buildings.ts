export type UTBuilding = {
  name: string;
  code: string;
  lat: number;
  lng: number;
  category: string;
};

export const UT_BUILDINGS: UTBuilding[] = [
  // Academic / Admin
  { name: "Peter T Flawn Academic Center (FAC)", code: "FAC", lat: 30.2858, lng: -97.7403, category: "Academic" },
  { name: "Main Building / UT Tower (MAI)", code: "MAI", lat: 30.2862, lng: -97.7394, category: "Academic" },
  { name: "Waggener Hall (WAG)", code: "WAG", lat: 30.2857, lng: -97.7397, category: "Academic" },
  { name: "Batts Hall (BAT)", code: "BAT", lat: 30.2849, lng: -97.7393, category: "Academic" },
  { name: "Garrison Hall (GAR)", code: "GAR", lat: 30.2854, lng: -97.7400, category: "Academic" },
  { name: "Benedict Hall (BEN)", code: "BEN", lat: 30.2851, lng: -97.7396, category: "Academic" },

  // Engineering
  { name: "Gates Dell Complex (GDC)", code: "GDC", lat: 30.2862, lng: -97.7365, category: "Engineering" },
  { name: "Ernest Cockrell Jr. Hall (ECJ)", code: "ECJ", lat: 30.2842, lng: -97.7362, category: "Engineering" },
  { name: "Engineering Education & Research Center (EER)", code: "EER", lat: 30.2882, lng: -97.7355, category: "Engineering" },
  { name: "Engineering Teaching Center II (ETC)", code: "ETC", lat: 30.2839, lng: -97.7358, category: "Engineering" },
  { name: "Belo Center for New Media (BMC)", code: "BMC", lat: 30.2885, lng: -97.7367, category: "Engineering" },
  { name: "Applied Computational Engineering & Sciences (ACES)", code: "ACES", lat: 30.2870, lng: -97.7350, category: "Engineering" },
  { name: "Petroleum & Geosystems Engineering (CPE)", code: "CPE", lat: 30.2836, lng: -97.7368, category: "Engineering" },
  { name: "Taylor Hall (TAY)", code: "TAY", lat: 30.2845, lng: -97.7355, category: "Engineering" },

  // Sciences & Math
  { name: "Welch Hall (WEL)", code: "WEL", lat: 30.2868, lng: -97.7385, category: "Sciences" },
  { name: "Robert Lee Moore Hall (RLM)", code: "RLM", lat: 30.2859, lng: -97.7380, category: "Sciences" },
  { name: "Painter Hall (PAI)", code: "PAI", lat: 30.2855, lng: -97.7389, category: "Sciences" },
  { name: "Norman Hackerman Building (NHB)", code: "NHB", lat: 30.2875, lng: -97.7378, category: "Sciences" },
  { name: "Experimental Science Building (ESB)", code: "ESB", lat: 30.2880, lng: -97.7372, category: "Sciences" },
  { name: "Physics, Math & Astronomy (PMA)", code: "PMA", lat: 30.2863, lng: -97.7376, category: "Sciences" },
  { name: "Seay Building (SEA)", code: "SEA", lat: 30.2845, lng: -97.7378, category: "Sciences" },
  { name: "Patterson Labs (PAT)", code: "PAT", lat: 30.2852, lng: -97.7372, category: "Sciences" },
  { name: "Chemistry & Physics Building (CPB)", code: "CPB", lat: 30.2871, lng: -97.7381, category: "Sciences" },
  { name: "Biomedical Engineering Building (BME)", code: "BME", lat: 30.2889, lng: -97.7358, category: "Sciences" },
  { name: "Molecular Biology Building (MBB)", code: "MBB", lat: 30.2893, lng: -97.7364, category: "Sciences" },
  { name: "Pickle Research Campus (PRC)", code: "PRC", lat: 30.3873, lng: -97.7252, category: "Sciences" },

  // Business
  { name: "McCombs School of Business (UTC)", code: "UTC", lat: 30.2839, lng: -97.7398, category: "Business" },
  { name: "CBA Building (CBA)", code: "CBA", lat: 30.2835, lng: -97.7395, category: "Business" },
  { name: "Rowling Hall (ROW)", code: "ROW", lat: 30.2833, lng: -97.7407, category: "Business" },

  // Liberal Arts / Humanities
  { name: "Mezes Hall (MEZ)", code: "MEZ", lat: 30.2845, lng: -97.7379, category: "Liberal Arts" },
  { name: "Calhoun Hall (CAL)", code: "CAL", lat: 30.2837, lng: -97.7383, category: "Liberal Arts" },
  { name: "Parlin Hall (PAR)", code: "PAR", lat: 30.2848, lng: -97.7370, category: "Liberal Arts" },
  { name: "Burdine Hall (BUR)", code: "BUR", lat: 30.2830, lng: -97.7374, category: "Liberal Arts" },
  { name: "Gebauer Building (GEB)", code: "GEB", lat: 30.2855, lng: -97.7410, category: "Liberal Arts" },
  { name: "Sutton Hall (SUT)", code: "SUT", lat: 30.2858, lng: -97.7406, category: "Liberal Arts" },
  { name: "Jessen Auditorium (JES)", code: "JES", lat: 30.2869, lng: -97.7401, category: "Liberal Arts" },
  { name: "Pearce Hall (PEA)", code: "PEA", lat: 30.2840, lng: -97.7390, category: "Liberal Arts" },
  { name: "Gordon White Building (GWB)", code: "GWB", lat: 30.2832, lng: -97.7369, category: "Liberal Arts" },
  { name: "Benson Hall (BNS)", code: "BNS", lat: 30.2826, lng: -97.7363, category: "Liberal Arts" },
  { name: "Undergraduate Studies (UTS)", code: "UTS", lat: 30.2838, lng: -97.7405, category: "Liberal Arts" },

  // Social Sciences / Law / Public Affairs
  { name: "Townes Hall – UT Law (TNH)", code: "TNH", lat: 30.2884, lng: -97.7406, category: "Law" },
  { name: "Lyndon B. Johnson School of Public Affairs (SRH)", code: "SRH", lat: 30.2877, lng: -97.7395, category: "Public Affairs" },
  { name: "Sid Richardson Hall (SRH2)", code: "SRH2", lat: 30.2875, lng: -97.7392, category: "Public Affairs" },
  { name: "Tom Lea / Jesse Jones Hall (JON)", code: "JON", lat: 30.2860, lng: -97.7412, category: "Public Affairs" },
  { name: "Will C. Hogg Building (WCH)", code: "WCH", lat: 30.2864, lng: -97.7408, category: "Social Sciences" },

  // Communication / Journalism
  { name: "Moody Communication Building (CMA)", code: "CMA", lat: 30.2840, lng: -97.7414, category: "Communication" },
  { name: "Jesse H. Jones Communication Center (CMC)", code: "CMC", lat: 30.2842, lng: -97.7410, category: "Communication" },
  { name: "Communication Building B (CMB)", code: "CMB", lat: 30.2844, lng: -97.7418, category: "Communication" },

  // Education / Social Work
  { name: "Sanchez Building (SZB)", code: "SZB", lat: 30.2825, lng: -97.7365, category: "Education" },
  { name: "George I. Sánchez Building (SZB2)", code: "SZB2", lat: 30.2822, lng: -97.7360, category: "Education" },
  { name: "Education Building (EDU)", code: "EDU", lat: 30.2829, lng: -97.7371, category: "Education" },
  { name: "School of Social Work (SSW)", code: "SSW", lat: 30.2818, lng: -97.7358, category: "Social Work" },

  // Architecture & Planning
  { name: "Goldsmith Hall (GOL)", code: "GOL", lat: 30.2867, lng: -97.7415, category: "Architecture" },
  { name: "Battle Hall (BAT2)", code: "BAT2", lat: 30.2869, lng: -97.7418, category: "Architecture" },
  { name: "Sutton Hall (SUT2)", code: "SUT2", lat: 30.2865, lng: -97.7419, category: "Architecture" },
  { name: "West Mall Building (WMB)", code: "WMB", lat: 30.2861, lng: -97.7422, category: "Architecture" },

  // Natural Sciences / Life Sciences
  { name: "Patterson Labs (PAT2)", code: "PAT2", lat: 30.2853, lng: -97.7372, category: "Natural Sciences" },
  { name: "Waggener Hall (WAG2)", code: "WAG2", lat: 30.2857, lng: -97.7397, category: "Natural Sciences" },
  { name: "Biological Laboratories (BIO)", code: "BIO", lat: 30.2876, lng: -97.7369, category: "Natural Sciences" },
  { name: "Zoology Building (ZOO)", code: "ZOO", lat: 30.2872, lng: -97.7373, category: "Natural Sciences" },
  { name: "Pharmacy Building (PHR)", code: "PHR", lat: 30.2834, lng: -97.7356, category: "Pharmacy" },
  { name: "Dell Medical School (DMS)", code: "DMS", lat: 30.2801, lng: -97.7291, category: "Medical" },
  { name: "Health Learning Building (HLB)", code: "HLB", lat: 30.2797, lng: -97.7286, category: "Medical" },
  { name: "Dell Seton Medical Center (DSM)", code: "DSM", lat: 30.2791, lng: -97.7278, category: "Medical" },

  // Fine Arts / Music
  { name: "Winship Drama Building (WIN)", code: "WIN", lat: 30.2851, lng: -97.7323, category: "Fine Arts" },
  { name: "B. Iden Payne Theatre (PAY)", code: "PAY", lat: 30.2850, lng: -97.7318, category: "Fine Arts" },
  { name: "Oscar G. Brockett Theatre (BRO)", code: "BRO", lat: 30.2847, lng: -97.7320, category: "Fine Arts" },
  { name: "Performing Arts Center (PAC)", code: "PAC", lat: 30.2856, lng: -97.7325, category: "Fine Arts" },
  { name: "Music Building (MUS)", code: "MUS", lat: 30.2860, lng: -97.7330, category: "Fine Arts" },
  { name: "Art Building (ART)", code: "ART", lat: 30.2864, lng: -97.7328, category: "Fine Arts" },
  { name: "Visual Arts Center (VAC)", code: "VAC", lat: 30.2866, lng: -97.7322, category: "Fine Arts" },
  { name: "Blanton Museum of Art", code: "BMA", lat: 30.2810, lng: -97.7385, category: "Fine Arts" },
  { name: "Harry Ransom Center (HRC)", code: "HRC", lat: 30.2865, lng: -97.7421, category: "Fine Arts" },

  // Libraries
  { name: "Perry-Castañeda Library (PCL)", code: "PCL", lat: 30.2826, lng: -97.7382, category: "Library" },
  { name: "Life Science Library (LSL)", code: "LSL", lat: 30.2864, lng: -97.7373, category: "Library" },
  { name: "Fine Arts Library (FAL)", code: "FAL", lat: 30.2858, lng: -97.7322, category: "Library" },
  { name: "Tarlton Law Library (TAR)", code: "TAR", lat: 30.2882, lng: -97.7407, category: "Library" },
  { name: "Benson Latin American Collection (BEN2)", code: "BEN2", lat: 30.2817, lng: -97.7374, category: "Library" },

  // Student Life / Admin
  { name: "Texas Union (UNB)", code: "UNB", lat: 30.2862, lng: -97.7403, category: "Student Life" },
  { name: "Student Activity Center (SAC)", code: "SAC", lat: 30.2865, lng: -97.7394, category: "Student Life" },
  { name: "Gregory Gymnasium (GRE)", code: "GRE", lat: 30.2843, lng: -97.7346, category: "Student Life" },
  { name: "Recreational Sports Center (RSC)", code: "RSC", lat: 30.2855, lng: -97.7340, category: "Student Life" },
  { name: "Anna Hiss Gymnasium (AHG)", code: "AHG", lat: 30.2834, lng: -97.7353, category: "Student Life" },
  { name: "Dobie Center", code: "DOB", lat: 30.2838, lng: -97.7417, category: "Student Life" },
  { name: "Jester Center (JES2)", code: "JES2", lat: 30.2827, lng: -97.7367, category: "Residence Hall" },
  { name: "Kinsolving Dormitory (KIN)", code: "KIN", lat: 30.2893, lng: -97.7404, category: "Residence Hall" },
  { name: "Littlefield Home (LLF)", code: "LLF", lat: 30.2870, lng: -97.7404, category: "Landmark" },
  { name: "Hogg Memorial Auditorium (HOG)", code: "HOG", lat: 30.2866, lng: -97.7407, category: "Student Life" },
  { name: "Student Services Building (SSB)", code: "SSB", lat: 30.2821, lng: -97.7381, category: "Admin" },
  { name: "Flawn Academic Center (FAC)", code: "FAC2", lat: 30.2858, lng: -97.7403, category: "Academic" },
  { name: "University Testing Center (UTC2)", code: "UTC2", lat: 30.2839, lng: -97.7398, category: "Admin" },
  { name: "Office of the Registrar (MAI2)", code: "MAI2", lat: 30.2862, lng: -97.7394, category: "Admin" },

  // Athletics
  { name: "Darrell K Royal – Texas Memorial Stadium (DKR)", code: "DKR", lat: 30.2836, lng: -97.7326, category: "Athletics" },
  { name: "Frank Erwin Center (FEC)", code: "FEC", lat: 30.2779, lng: -97.7319, category: "Athletics" },
  { name: "Mike A. Myers Track & Soccer Stadium (MAM)", code: "MAM", lat: 30.2808, lng: -97.7295, category: "Athletics" },
  { name: "Disch-Falk Field (DFF)", code: "DFF", lat: 30.2803, lng: -97.7302, category: "Athletics" },
  { name: "Red & Charline McCombs Field (softball)", code: "MCF", lat: 30.2798, lng: -97.7309, category: "Athletics" },
  { name: "Lee & Joe Jamail Texas Swimming Center (JSC)", code: "JSC", lat: 30.2848, lng: -97.7342, category: "Athletics" },
  { name: "Belmont Hall (BEL)", code: "BEL", lat: 30.2842, lng: -97.7347, category: "Athletics" },

  // Parking & Transport
  { name: "Guadalupe Parking Garage (GRG)", code: "GRG", lat: 30.2836, lng: -97.7428, category: "Parking" },
  { name: "Manor Garage (MNR)", code: "MNR", lat: 30.2877, lng: -97.7278, category: "Parking" },
  { name: "East Campus Garage (ECG)", code: "ECG", lat: 30.2815, lng: -97.7278, category: "Parking" },
  { name: "San Jacinto Parking Garage (SJG)", code: "SJG", lat: 30.2831, lng: -97.7296, category: "Parking" },
  { name: "UT Shuttle – Dean Keaton Stop", code: "DKS", lat: 30.2893, lng: -97.7388, category: "Transit" },
  { name: "UT Shuttle – Speedway Stop", code: "SPD", lat: 30.2880, lng: -97.7398, category: "Transit" },
];
