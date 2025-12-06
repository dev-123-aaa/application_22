import { Video } from "./types";

const squidwardScript = `Have you ever stopped to think about who the real protagonist of SpongeBob SquarePants actually is? Sure, the show is named after our favorite yellow sponge, but I'm here to argue that Squidward Tentacles is the true main character of this beloved series. And no, I'm not just saying this because I relate to his constant state of existential dread.

Let's break down the evidence. Throughout the show's run, Squidward serves as the emotional anchor that grounds us in reality. While SpongeBob represents unbridled optimism and Patrick embodies blissful ignorance, Squidward is the character we actually identify with. He has dreams, ambitions, and frustrations that mirror our own adult experiences. His artistic pursuits, his desire for peace and quiet, his struggles with annoying neighbors – these are universal experiences.

Furthermore, the most emotionally impactful episodes of the series are often centered around Squidward's character development. Episodes like "Band Geeks," widely considered one of the greatest cartoon episodes ever made, culminate in Squidward's triumph. The show uses SpongeBob as a catalyst, but Squidward is where the heart of the story truly lies. He's not just a grumpy neighbor – he's the lens through which we experience Bikini Bottom.`;

const darkTruthScript = `Bikini Bottom. A peaceful underwater city where fish go about their daily lives, crabs run restaurants, and a certain yellow sponge works as a fry cook. But beneath this cheerful facade lies a web of mysteries that the show has been hiding in plain sight for over two decades.

First, let's address the elephant in the room – or should I say, the nuclear testing site above the room. Bikini Bottom is located directly beneath Bikini Atoll, the site of numerous nuclear tests conducted by the United States in the 1940s and 50s. This isn't just a fun naming coincidence. The mutations, the talking sea creatures, the physics-defying underwater fires – suddenly it all starts to make a disturbing amount of sense.

But the rabbit hole goes deeper. Have you noticed how Mr. Krabs is suspiciously secretive about the Krabby Patty formula? How Plankton, despite being a genius inventor, can never seem to succeed? Some theorists suggest this is all part of an elaborate arrangement between the two former friends. The "competition" keeps both businesses relevant while ensuring neither gains too much power. The real secret ingredient? A carefully maintained status quo that benefits everyone at the top of Bikini Bottom's economic hierarchy.`;

const krabbyPattyScript = `The Krabby Patty secret formula is perhaps the greatest mystery in animated television history. For over 25 years, fans have theorized about what makes this underwater burger so irresistible. Today, we're ranking every major theory from least to most plausible.

Starting at the bottom of our list: the "crab meat" theory. Yes, some fans have suggested that Mr. Krabs, a crab, serves crab meat in his patties. While darkly humorous, this theory falls apart when you consider that we've seen Mr. Krabs' mother and other crab relatives who would presumably object to this culinary choice. Plus, Krabs is too cheap to use real meat anyway.

Moving up, we have the "MSG" or "addictive substance" theories. These suggest that the secret ingredient is something that creates dependency in customers. While this explains the almost cult-like devotion Bikini Bottom residents have to Krabby Patties, it seems a bit too dark for a kids' show. The most compelling theory? Love. Not in a cheesy way, but in the sense that SpongeBob's genuine passion and care for his craft is what makes each patty special. The formula might just be a placebo – the real secret is having someone who truly cares making your food.`;

const thumbnailBase = "https://placehold.co/1280x720";

export const mockVideos: Video[] = [
  {
    project_id: "vid_001",
    title: "Why Squidward Is Actually The Main Character",
    status: "Published",
    created_at: "2024-11-15T10:30:00Z",
    total_sections: 8,
    duration_hours: 0,
    duration_minutes: 24,
    main_characters: "Squidward, SpongeBob, Patrick",
    primary_locations: "Squidward's House, Krusty Krab",
    central_theme: "Character analysis and hidden protagonist theory",
    tone: "Analytical, thought-provoking",
    script: squidwardScript,
    thumbnail_suggestions: [
      `${thumbnailBase}/1a1a1a/00d4ff?text=Squidward+Spotlight+1`,
      `${thumbnailBase}/1a1a1a/ffd700?text=Squidward+Spotlight+2`,
      `${thumbnailBase}/0a0a0a/00d4ff?text=Squidward+Spotlight+3`,
      `${thumbnailBase}/1a1a1a/ffffff?text=Squidward+Spotlight+4`,
    ],
    script_approved: true,
    video_status: "Video Finished",
    video_drive_folder: "https://drive.google.com/drive/folders/example1",
  },
  {
    project_id: "vid_002",
    title: "The Dark Truth About Bikini Bottom",
    status: "Voiceover in progress",
    created_at: "2024-11-28T14:15:00Z",
    total_sections: 12,
    duration_hours: 0,
    duration_minutes: 38,
    main_characters: "SpongeBob, Mr. Krabs, Plankton",
    primary_locations: "Bikini Bottom, Chum Bucket",
    central_theme: "Hidden lore and conspiracy theories",
    tone: "Mysterious, investigative",
    script: darkTruthScript,
    thumbnail_suggestions: [
      `${thumbnailBase}/0a0a0a/ff4444?text=Dark+Truth+1`,
      `${thumbnailBase}/1a1a1a/ff4444?text=Dark+Truth+2`,
      `${thumbnailBase}/0a0a0a/ffd700?text=Dark+Truth+3`,
    ],
    script_approved: true,
    video_status: "Rendering",
    video_drive_folder: null,
  },
  {
    project_id: "vid_003",
    title: "Every Krabby Patty Secret Ingredient Theory Ranked",
    status: "Images generating",
    created_at: "2024-11-30T09:00:00Z",
    total_sections: 10,
    duration_hours: 0,
    duration_minutes: 31,
    main_characters: "Mr. Krabs, Plankton, SpongeBob",
    primary_locations: "Krusty Krab, Chum Bucket",
    central_theme: "Fan theories exploration",
    tone: "Fun, engaging",
    script: krabbyPattyScript,
    thumbnail_suggestions: [
      `${thumbnailBase}/1a1a1a/00d4ff?text=Krabby+Patty+1`,
      `${thumbnailBase}/0a0a0a/ffd700?text=Krabby+Patty+2`,
      `${thumbnailBase}/1a1a1a/22c55e?text=Krabby+Patty+3`,
      `${thumbnailBase}/1a1a1a/00d4ff?text=Krabby+Patty+4`,
    ],
    script_approved: false,
    video_status: null,
    video_drive_folder: null,
  },
  {
    project_id: "vid_004",
    title: "Patrick Star: Secret Genius or Just Lucky?",
    status: "Outline in progress",
    created_at: "2024-12-01T16:45:00Z",
    total_sections: 6,
    duration_hours: 0,
    duration_minutes: 18,
    main_characters: "Patrick, SpongeBob",
    primary_locations: "Patrick's Rock, Jellyfish Fields",
    central_theme: "Character deep dive",
    tone: "Comedic, analytical",
    script_approved: false,
    video_status: null,
    video_drive_folder: null,
  },
  {
    project_id: "vid_005",
    title: "The Untold Story of Sandy Cheeks",
    status: "Failed",
    created_at: "2024-11-20T11:20:00Z",
    total_sections: 9,
    duration_hours: 0,
    duration_minutes: 27,
    main_characters: "Sandy, SpongeBob",
    primary_locations: "Sandy's Treedome, Texas",
    central_theme: "Character backstory exploration",
    tone: "Emotional, nostalgic",
    script_approved: false,
    video_status: null,
    video_drive_folder: null,
  },
  {
    project_id: "vid_006",
    title: "Mr. Krabs: Capitalism Critique or Comedy Gold?",
    status: "Sections in creation",
    created_at: "2024-11-29T13:30:00Z",
    total_sections: 11,
    duration_hours: 0,
    duration_minutes: 35,
    main_characters: "Mr. Krabs, SpongeBob, Squidward",
    primary_locations: "Krusty Krab, Mr. Krabs' House",
    central_theme: "Social commentary analysis",
    tone: "Satirical, insightful",
    script_approved: false,
    video_status: null,
    video_drive_folder: null,
  },
];
