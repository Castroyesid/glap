import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Database, CheckCircle, XCircle, Map, BarChart3, FileText, Upload, Download, Eye } from 'lucide-react';

const ComprehensivePhonemicSystem = () => {
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedOverview, setSelectedOverview] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [validationResults, setValidationResults] = useState({});
  const [csvData, setCsvData] = useState(null);
  const [columnMapping, setColumnMapping] = useState({});
  const [importStep, setImportStep] = useState('upload');

  // Calculate unique counts for overview boxes
  const getOverviewStats = () => {
    const surfacePhonemesCounts = {};
    const elementarySegmentsCounts = {};
    const allSuprasegmentals = new Set();
    const suprasegmentalCounts = {};
    
    languages.forEach(lang => {
      (lang.surfacePhonemes || []).forEach(p => {
        surfacePhonemesCounts[p] = (surfacePhonemesCounts[p] || 0) + 1;
      });
      (lang.elementarySegments || []).forEach(s => {
        elementarySegmentsCounts[s] = (elementarySegmentsCounts[s] || 0) + 1;
      });
      (lang.suprasegmentals || []).forEach(sup => {
        allSuprasegmentals.add(sup);
        suprasegmentalCounts[sup] = (suprasegmentalCounts[sup] || 0) + 1;
      });
    });
    
    return {
      surfacePhonemesCounts,
      elementarySegmentsCounts,
      uniqueSuprasegmentals: Array.from(allSuprasegmentals),
      suprasegmentalCounts
    };
  };

  // Scroll to language inventory
  const scrollToLanguageInventory = () => {
    const element = document.querySelector('[data-inventory="true"]');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Feature specifications for elementary segments (only phonemically contrastive features)
  const segmentFeatures = {
    // Rotokas - phonemically contrastive features only
    'a': { high: '-', front: '0', occlusive: '0', consonantal: '-' },
    'ə': { high: '+', front: '0', occlusive: '0', consonantal: '-' },
    'w': { high: '0', front: '±', occlusive: '0', consonantal: '+' },
    'j': { high: '0', front: '+', occlusive: '0', consonantal: '+' },
    'k': { high: '0', front: '-', occlusive: '+', consonantal: '+' },
    // Hawaiian
    'ʔ': { high: '0', front: '-', voice: '-', occlusive: '+', consonantal: '+' },
    'h': { high: '0', front: '-', voice: '-', occlusive: '-', consonantal: '+' },
    // English vowels - phonemically contrastive
    'i': { high: '+', low: '-', front: '+', consonantal: '-' },
    'e': { high: '-', low: '-', front: '+', consonantal: '-' },
    'æ': { high: '-', low: '+', front: '+', consonantal: '-' },
    'u': { high: '+', low: '-', front: '-', consonantal: '-' },
    'o': { high: '-', low: '-', front: '-', consonantal: '-' },
    'ɑ': { high: '-', low: '+', front: '-', consonantal: '-' },
    // English consonants - phonemically contrastive
    't': { high: '0', low: '0', front: '+', occlusive: '+', consonantal: '+' },
    'θ': { high: '0', low: '0', front: '+', occlusive: '-', consonantal: '+' },
    'l': { high: '0', low: '0', front: '+', occlusive: '-', consonantal: '+' },
    'r': { high: '0', low: '0', front: '+', occlusive: '-', consonantal: '+' },
    'n': { high: '0', low: '0', front: '+', nasal: '+', consonantal: '+' }
  };

  // All possible binary features for display
  const allBinaryFeatures = ['high', 'low', 'front', 'voice', 'occlusive', 'nasal', 'consonantal'];

  // Enhanced mock data with proper English complexity
  const mockData = {
    rotokas: {
      id: 1,
      name: "Rotokas",
      family: "North Bougainville", 
      coordinates: [-6.2, 155.2],
      surfacePhonemes: [
        // Central Rotokas consonants
        "p", "t", "k", "b", "d", "g",
        // Aita Rotokas additional nasals
        "m", "n", "ŋ",
        // Central Rotokas vowels  
        "a", "e", "i", "o", "u",
        // Central Rotokas long vowels
        "aː", "eː", "iː", "oː", "uː"
      ],
      elementarySegments: ["a", "ə", "w", "j", "k"],
      suprasegmentals: ["length"],
      features: 4,
      complexity: "Simple",
      dialectNotes: "Long vowels phonemic in Central Rotokas only; nasal consonants phonemic in Aita Rotokas only",
      surfaceMappings: [
        // Voiceless consonants (Ck = voiceless)
        { surface: "p", elementary: "wk", notes: "Ck = voiceless consonant" },
        { surface: "t", elementary: "jk", notes: "Ck = voiceless consonant" },
        { surface: "k", elementary: "kk", notes: "Ck = voiceless consonant" },
        // Voiced consonants (C alone = voiced)
        { surface: "b", elementary: "w", notes: "voiced, underlyingly nasal" },
        { surface: "d", elementary: "j", notes: "voiced, underlyingly nasal" },
        { surface: "g", elementary: "k", notes: "voiced, underlyingly nasal" },
        // Nasal consonants (CkC = nasal due to underlyingly nasal C) - only phonemic in Aita Rotokas
        { surface: "m", elementary: "wkw", notes: "nasal due to underlyingly nasal w (Aita Rotokas only)" },
        { surface: "n", elementary: "jkj", notes: "nasal due to underlyingly nasal j (Aita Rotokas only)" },
        { surface: "ŋ", elementary: "kkj", notes: "nasal due to underlyingly nasal j (Aita Rotokas only)" },
        // Basic vowels
        { surface: "a", elementary: "a", notes: "low vowel elementary" },
        { surface: "e", elementary: "ə", notes: "high vowel elementary" },
        // Complex vowels
        { surface: "i", elementary: "əj", notes: "high (ə) + front (j)" },
        { surface: "o", elementary: "aw", notes: "mid (a) + back (w)" },
        { surface: "u", elementary: "əw", notes: "high (ə) + back (w)" },
        // Long vowels (with length suprasegmental) - only phonemic in Central Rotokas
        { surface: "aː", elementary: "a:", notes: "low vowel + length (Central Rotokas only)" },
        { surface: "eː", elementary: "ə:", notes: "high vowel + length (Central Rotokas only)" },
        { surface: "iː", elementary: "əj:", notes: "high (ə) + front (j) + length (Central Rotokas only)" },
        { surface: "oː", elementary: "aw:", notes: "mid (a) + back (w) + length (Central Rotokas only)" },
        { surface: "uː", elementary: "əw:", notes: "high (ə) + back (w) + length (Central Rotokas only)" }
      ]
    },
    hawaiian: {
      id: 2,
      name: "Hawaiian",
      family: "Austronesian > Oceanic",
      coordinates: [21.3, -157.8], 
      surfacePhonemes: [
        // Consonants
        "m", "n", "l", "p", "t", "ʔ", "h", "w",
        // Surface vowels (with length marked by ː)
        "i", "iː", "u", "uː", "e", "eː", "a", "aː", "o", "oː", 
        // Surface diphthongs
        "iu", "ou", "oi", "eu", "ei", "au", "ai", "ao", "ae",
        // Surface long diphthongs  
        "oːu", "eːi", "aːu", "aːi", "aːo", "aːe"
      ],
      analyzedPhonemes: [
        // Consonants
        "m", "n", "l", "p", "t", "ʔ", "h", "w",
        // Analyzed vowels (length as doubling)
        "a", "e", "i", "o", "u", "aa", "ee", "ii", "oo", "uu",
        // Analyzed diphthongs
        "ai", "au", "ei", "eu", "iu", "oi", "ou", "ao", "ae",
        // Analyzed long diphthongs
        "aai", "aau", "aao", "aae", "eei", "oou"
      ],
      elementarySegments: ["a", "ə", "w", "j", "ʔ", "h"],
      suprasegmentals: ["length"],
      features: 4,
      complexity: "Simple",
      surfaceMappings: [
        // Consonants
        { surface: "m", elementary: "ʔw", notes: "ʔw = nasal (no h marker)" },
        { surface: "n", elementary: "ʔj", notes: "ʔj = nasal (no h marker)" },
        { surface: "p", elementary: "ʔwh", notes: "ʔwh = voiceless stop" },
        { surface: "t", elementary: "ʔjh", notes: "ʔjh = voiceless stop" },
        { surface: "l", elementary: "jh", notes: "jh = lateral" },
        { surface: "ʔ", elementary: "ʔ", notes: "elementary segment" },
        { surface: "h", elementary: "h", notes: "elementary segment" },
        { surface: "w", elementary: "w", notes: "elementary segment" },
        // Basic vowels
        { surface: "a", elementary: "a", notes: "elementary vowel" },
        { surface: "e", elementary: "ə", notes: "elementary vowel" },
        { surface: "i", elementary: "əj", notes: "high front = ə + j" },
        { surface: "o", elementary: "aw", notes: "mid back = a + w" },
        { surface: "u", elementary: "əw", notes: "high back = ə + w" },
        // Long vowels (surface iː → analyzed ii → elementary with length suprasegmental)
        { surface: "iː", elementary: "əj:", notes: "ii = əj + length" },
        { surface: "uː", elementary: "əw:", notes: "uu = əw + length" },
        { surface: "eː", elementary: "ə:", notes: "ee = ə + length" },
        { surface: "aː", elementary: "a:", notes: "aa = a + length" },
        { surface: "oː", elementary: "aw:", notes: "oo = aw + length" },
        // Diphthongs
        { surface: "ai", elementary: "aəj", notes: "a + i diphthong" },
        { surface: "au", elementary: "aəw", notes: "a + u diphthong" },
        { surface: "ei", elementary: "əəj", notes: "e + i diphthong" },
        { surface: "eu", elementary: "əəw", notes: "e + u diphthong" },
        { surface: "iu", elementary: "əjəw", notes: "i + u diphthong" },
        { surface: "oi", elementary: "awəj", notes: "o + i diphthong" },
        { surface: "ou", elementary: "awəw", notes: "o + u diphthong" },
        { surface: "ao", elementary: "aaw", notes: "a + o diphthong" },
        { surface: "ae", elementary: "aə", notes: "a + e diphthong" },
        // Long diphthongs
        { surface: "oːu", elementary: "awəw:", notes: "oou = awəw + length" },
        { surface: "eːi", elementary: "əəj:", notes: "eei = əəj + length" },
        { surface: "aːu", elementary: "aəw:", notes: "aau = aəw + length" },
        { surface: "aːi", elementary: "aəj:", notes: "aai = aəj + length" },
        { surface: "aːo", elementary: "aaw:", notes: "aao = aaw + length" },
        { surface: "aːe", elementary: "aə:", notes: "aae = aə + length" }
      ]
    },
    english: {
      id: 3,
      name: "English",
      family: "Indo-European > Germanic",
      coordinates: [52.0, -1.0],
      surfacePhonemes: [
        // ANAE vowel keywords with surface forms
        "æ", "æː", "ɑː", "ɒ", "ɒː", "ɔː", "ɪ", "ɛ", "ʌ", "ʊ", 
        "eɪ", "əʊ", "iː", "uː", "aɪ", "ɔɪ", "aʊ", "ɜː", "ɑː", "ɔː", 
        "ɒː", "ɪə", "ɛː", "ʊə", "ə", "ər", "i",
        // Consonants
        "m", "n", "ŋ", "p", "t", "tʃ", "k", "ʔ", "b", "d", "dʒ", "g",
        "f", "θ", "s", "ʃ", "h", "v", "ð", "z", "ʒ", "l", "r", "j", "w"
      ],
      analyzedPhonemes: [
        // Labov-style VC analysis
        "æ", "æh", "ah", "a", "oh", "oh", "i", "e", "o", "u",
        "ej", "ow", "ij", "uw", "aj", "oj", "aw", "ər", "ær", "or",
        "ar", "ir", "er", "ur", "ə", "ər", "i",
        // Consonants (unchanged)
        "m", "n", "ŋ", "p", "t", "tʃ", "k", "ʔ", "b", "d", "dʒ", "g",
        "f", "θ", "s", "ʃ", "h", "v", "ð", "z", "ʒ", "l", "r", "j", "w"
      ],
      elementarySegments: ["i", "e", "æ", "u", "o", "ɑ", "t", "θ", "ʔ", "w", "j", "l", "r", "n"],
      suprasegmentals: ["length"],
      features: 7,
      complexity: "Medium",
      surfaceMappings: [
        // Elementary vowels
        { surface: "ɪ", elementary: "i", rule: "+high, +front elementary" },
        { surface: "ɛ", elementary: "e", rule: "-high, -low, +front elementary" },
        { surface: "æ", elementary: "æ", rule: "-high, +low, +front elementary" },
        { surface: "ʊ", elementary: "u", rule: "+high, -front elementary" },
        { surface: "ʌ", elementary: "o", rule: "-high, -low, -front elementary" },
        { surface: "ɒ", elementary: "ɑ", rule: "-high, +low, -front elementary" },
        // Labov VC vowels (h = length marker, not fricative)
        { surface: "æː", elementary: "æh", notes: "low front + length (h)" },
        { surface: "ɑː", elementary: "ɑh", notes: "low back + length (h)" },
        { surface: "ɔː", elementary: "oh", notes: "mid back + length (h)" },
        { surface: "eɪ", elementary: "ej", notes: "mid front + front (j)" },
        { surface: "əʊ", elementary: "ow", notes: "mid + back (w)" },
        { surface: "iː", elementary: "ij", notes: "high front + front (j)" },
        { surface: "uː", elementary: "uw", notes: "high back + back (w)" },
        { surface: "aɪ", elementary: "ɑj", notes: "low + front (j)" },
        { surface: "ɔɪ", elementary: "oj", notes: "mid back + front (j)" },
        { surface: "aʊ", elementary: "ɑw", notes: "low + back (w)" },
        { surface: "ɜː", elementary: "ər", notes: "mid + rhotic (r)" },
        { surface: "ɪə", elementary: "ir", notes: "high front + rhotic (r)" },
        { surface: "ɛː", elementary: "er", notes: "mid front + rhotic (r)" },
        { surface: "ʊə", elementary: "ur", notes: "high back + rhotic (r)" },
        // Consonants with feature contributions
        { surface: "m", elementary: "n", notes: "nasal elementary" },
        { surface: "n", elementary: "n", notes: "nasal elementary" },
        { surface: "ŋ", elementary: "n", notes: "nasal elementary" },
        { surface: "p", elementary: "tw", notes: "occlusive + back (w)" },
        { surface: "t", elementary: "t", notes: "occlusive elementary" },
        { surface: "k", elementary: "tʔ", notes: "occlusive + back (ʔ)" },
        { surface: "b", elementary: "ntw", notes: "voiced occlusive + back" },
        { surface: "d", elementary: "nt", notes: "voiced occlusive" },
        { surface: "g", elementary: "ntʔ", notes: "voiced occlusive + back" },
        { surface: "s", elementary: "tl", notes: "occlusive + lateral" },
        { surface: "z", elementary: "l", notes: "lateral = voiced fricative" },
        { surface: "ʃ", elementary: "tr", notes: "occlusive + rhotic" },
        { surface: "ʒ", elementary: "ntr", notes: "voiced occlusive + rhotic" },
        { surface: "tʃ", elementary: "tj", notes: "occlusive + front (j)" },
        { surface: "dʒ", elementary: "ntj", notes: "voiced occlusive + front" },
        { surface: "f", elementary: "θw", notes: "fricative + back (w)" },
        { surface: "v", elementary: "nθw", notes: "voiced fricative + back" },
        { surface: "θ", elementary: "θ", notes: "fricative elementary" },
        { surface: "ð", elementary: "nθ", notes: "voiced fricative" },
        { surface: "h", elementary: "θʔ", notes: "fricative + glottal" },
        { surface: "l", elementary: "l", notes: "lateral elementary" },
        { surface: "r", elementary: "r", notes: "rhotic elementary" },
        { surface: "j", elementary: "j", notes: "front elementary" },
        { surface: "w", elementary: "w", notes: "back elementary" }
      ]
    }
  };

  useEffect(() => {
    setLanguages(Object.values(mockData));
  }, []);

  // Real validation logic
  const validateLanguage = (language) => {
    const results = {};
    
    // 1. Completeness: All surface phonemes have mappings
    const mappedSurface = new Set(language.surfaceMappings.map(m => m.surface));
    const unmappedPhonemes = language.surfacePhonemes.filter(p => !mappedSurface.has(p));
    
    results.completeness = {
      passed: unmappedPhonemes.length === 0,
      message: unmappedPhonemes.length === 0 
        ? "All surface phonemes have elementary mappings"
        : `Unmapped phonemes: ${unmappedPhonemes.join(', ')}`,
      details: unmappedPhonemes
    };

    // 2. Minimality: All elementary segments are used
    const elementarySet = new Set(language.elementarySegments);
    const usedInMappings = new Set();
    
    language.surfaceMappings.forEach(mapping => {
      language.elementarySegments.forEach(seg => {
        if (mapping.elementary.includes(seg)) {
          usedInMappings.add(seg);
        }
      });
    });
    
    const unusedSegments = [...elementarySet].filter(seg => !usedInMappings.has(seg));
    
    results.minimality = {
      passed: unusedSegments.length === 0,
      message: unusedSegments.length === 0
        ? "All elementary segments are utilized"
        : `Potentially unused segments: ${unusedSegments.join(', ')}`,
      details: unusedSegments
    };

    // 3. Complexity: Track segment complexity distribution
    const optimized = language.surfaceMappings.filter(m => m.elementary.length <= 3);
    const complex = language.surfaceMappings.filter(m => m.elementary.length > 3 && m.elementary.length <= 6);
    const invalid = language.surfaceMappings.filter(m => m.elementary.length > 6);
    
    results.complexity = {
      passed: invalid.length === 0,
      message: invalid.length === 0
        ? `${optimized.length} optimized, ${complex.length} complex, ${invalid.length} invalid`
        : `Invalid mappings (>6 segments): ${invalid.map(m => `${m.surface}→${m.elementary}`).join(', ')}`,
      details: { optimized: optimized.length, complex: complex.length, invalid: invalid.length }
    };

    return results;
  };

  const runValidation = (languageId) => {
    const language = languages.find(l => l.id === languageId);
    if (!language) return;
    
    const results = validateLanguage(language);
    setValidationResults(prev => ({
      ...prev,
      [languageId]: results
    }));
  };

  const calculateSimilarity = (lang1, lang2) => {
    const set1 = new Set(lang1.elementarySegments);
    const set2 = new Set(lang2.elementarySegments);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    // Functional equivalence detection (k≈ʔ)
    const functionalEquivalents = { 'k': 'ʔ', 'ʔ': 'k' };
    let functionalIntersection = new Set(intersection);
    
    [...set1].forEach(seg1 => {
      [...set2].forEach(seg2 => {
        if (functionalEquivalents[seg1] === seg2) {
          functionalIntersection.add(seg1);
        }
      });
    });
    
    return {
      jaccard: (intersection.size / union.size * 100).toFixed(1),
      functionalJaccard: (functionalIntersection.size / union.size * 100).toFixed(1),
      shared: Array.from(intersection),
      unique1: Array.from(set1).filter(x => !set2.has(x)),
      unique2: Array.from(set2).filter(x => !set1.has(x))
    };
  };

  // CSV Import functionality
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target.result;
      const lines = csv.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx] || '';
        });
        return row;
      });

      setCsvData({ headers, rows });
      setImportStep('map');
    };
    reader.readAsText(file);
  }, []);

  const exportTemplate = () => {
    const template = `language_name,language_family,iso_code,latitude,longitude,surface_phonemes,elementary_segments,suprasegmentals,surface_count,elementary_count
Rotokas,North Bougainville,roo,-6.2,155.2,"p t k b d g m n ŋ a e i o u aː eː iː oː uː","a ə w j k",length,20,5
Hawaiian,Austronesian,haw,21.3,-157.8,"m n l p t ʔ h w i iː u uː e eː a aː o oː iu ou oi eu ei au ai ao ae oːu eːi aːu aːi aːo aːe","a ə w j ʔ h",length,26,6
English,Indo-European,en,52.0,-1.0,"æ æː ɑː ɒ ɒː ɔː ɪ ɛ ʌ ʊ eɪ əʊ iː uː aɪ ɔɪ aʊ ɜː ɪə ɛː ʊə ə ər i m n ŋ p t tʃ k ʔ b d dʒ g f θ s ʃ h v ð z ʒ l r j w","i e æ u o ɑ t θ ʔ w j l r n",length,42,14`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'phonemic_analysis_template.csv';
    a.click();
  };

  // Tab Components
  const OverviewTab = () => {
    const stats = getOverviewStats();
    
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-blue-900 mb-4">
            Elementary Phonemic Analysis Project
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button 
              onClick={scrollToLanguageInventory}
              className="bg-white p-4 rounded shadow hover:bg-gray-50 text-left"
            >
              <div className="text-2xl font-bold text-blue-600">{languages.length}</div>
              <div className="text-sm text-gray-600">Languages Analyzed</div>
            </button>
            <button 
              onClick={() => setSelectedOverview('surface')}
              className="bg-white p-4 rounded shadow hover:bg-gray-50 text-left"
            >
              <div className="text-2xl font-bold text-green-600">{Object.keys(stats.surfacePhonemesCounts).length}</div>
              <div className="text-sm text-gray-600">Unique Surface Phonemes</div>
            </button>
            <button 
              onClick={() => setSelectedOverview('elementary')}
              className="bg-white p-4 rounded shadow hover:bg-gray-50 text-left"
            >
              <div className="text-2xl font-bold text-purple-600">{Object.keys(stats.elementarySegmentsCounts).length}</div>
              <div className="text-sm text-gray-600">Unique Elementary Segments</div>
            </button>
            <button 
              onClick={() => setSelectedOverview('suprasegmentals')}
              className="bg-white p-4 rounded shadow hover:bg-gray-50 text-left"
            >
              <div className="text-2xl font-bold text-orange-600">{stats.uniqueSuprasegmentals.length}</div>
              <div className="text-sm text-gray-600">Unique Suprasegmentals</div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden" data-inventory="true">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-lg font-semibold">Language Inventory</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Language</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Family</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Surface</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Elementary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reduction</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {languages.map((lang) => {
                  const surfaceCount = lang.surfacePhonemes?.length || 0;
                  const elementaryCount = lang.elementarySegments?.length || 0;
                  const reduction = surfaceCount > 0 ? ((1 - elementaryCount / surfaceCount) * 100).toFixed(1) : 0;
                  return (
                    <tr key={lang.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{lang.name}</div>
                        <div className="text-sm text-gray-500">{lang.complexity}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{lang.family}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{surfaceCount}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{elementaryCount}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          -{reduction}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button 
                          onClick={() => setSelectedLanguage(lang)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Details
                        </button>
                        <button 
                          onClick={() => runValidation(lang.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Validate
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const ValidationTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold">Validation Results</h3>
          <p className="text-sm text-gray-600 mt-1">Test theoretical predictions of the elementary segment method</p>
        </div>
        <div className="p-6">
          {languages.map(lang => {
            const results = validationResults[lang.id];
            return (
              <div key={lang.id} className="mb-6 p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-medium">{lang.name}</h4>
                  {!results && (
                    <button
                      onClick={() => runValidation(lang.id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    >
                      Run Validation
                    </button>
                  )}
                </div>
                
                {results && (
                  <div className="space-y-2">
                    {Object.entries(results).map(([rule, result]) => (
                      <div key={rule} className="flex items-center space-x-2">
                        {result.passed ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <span className="capitalize font-medium">{rule}:</span>
                        <span className="text-sm">{result.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const ComparisonTab = () => {
    const comparisons = [
      { lang1: mockData.rotokas, lang2: mockData.hawaiian },
      { lang1: mockData.rotokas, lang2: mockData.english },
      { lang1: mockData.hawaiian, lang2: mockData.english }
    ];

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-lg font-semibold">Cross-Linguistic Comparison</h3>
            <p className="text-sm text-gray-600 mt-1">Structural similarities in elementary segment systems</p>
          </div>
          <div className="p-6">
            {comparisons.map(({ lang1, lang2 }, idx) => {
              const similarity = calculateSimilarity(lang1, lang2);
              return (
                <div key={idx} className="mb-6 p-4 border rounded-lg">
                  <h4 className="text-lg font-medium mb-3">
                    {lang1.name} vs {lang2.name}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-blue-50 p-3 rounded">
                      <div className="text-xl font-bold text-blue-600">{similarity.jaccard}%</div>
                      <div className="text-sm text-gray-600">Segment Similarity</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded">
                      <div className="text-xl font-bold text-purple-600">{similarity.functionalJaccard}%</div>
                      <div className="text-sm text-gray-600">Functional Similarity</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <div className="text-xl font-bold text-green-600">{similarity.shared.length}</div>
                      <div className="text-sm text-gray-600">Shared Segments</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded">
                      <div className="text-xl font-bold text-red-600">
                        {Math.abs((lang1.elementarySegments?.length || 0) - (lang2.elementarySegments?.length || 0))}
                      </div>
                      <div className="text-sm text-gray-600">Size Difference</div>
                    </div>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div><strong>Shared segments:</strong> {similarity.shared.join(', ') || 'None'}</div>
                    <div><strong>Only in {lang1.name}:</strong> {similarity.unique1.join(', ') || 'None'}</div>
                    <div><strong>Only in {lang2.name}:</strong> {similarity.unique2.join(', ') || 'None'}</div>
                  </div>
                  
                  {lang1.name === "Rotokas" && lang2.name === "Hawaiian" && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded">
                      <strong>Structural Convergence:</strong> Despite genetic unrelatedness (North Bougainville vs Oceanic), 
                      these languages show remarkable structural similarity. Both reduce to small elementary segment systems (5-6) 
                      using similar organizational principles. With functional equivalence (k≈ʔ), Hawaiian essentially adds 
                      just /h/ to the Rotokas system.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const ImportTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Import Analysis Data</h3>
        
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Upload your phonemic analysis spreadsheet
              </span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                accept=".csv"
                onChange={handleFileUpload}
              />
              <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400">
                <div className="text-center">
                  <FileText className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium text-blue-600 hover:text-blue-500">
                      Click to upload
                    </span> or drag and drop
                  </div>
                  <p className="text-xs text-gray-500">CSV files only</p>
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Need a template?</h4>
          <p className="text-sm text-gray-600 mb-3">
            Download a CSV template with your three languages as examples
          </p>
          <button
            onClick={exportTemplate}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </button>
        </div>
      </div>
    </div>
  );

  // Overview Detail Modal with search, pagination, and filtering
  const OverviewDetailModal = ({ type, onClose }) => {
    const stats = getOverviewStats();
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // 'all', 'vowels', 'consonants'
    
    // Define vowels and consonants for filtering
    const vowels = ['a', 'e', 'i', 'o', 'u', 'æ', 'ɑ', 'ɛ', 'ɪ', 'ɒ', 'ɔ', 'ʊ', 'ʌ', 'ə', 'ɜ'];
    
    const isVowel = (phoneme) => {
      // Remove any diacritics and check if it's a vowel
      const clean = phoneme.replace(/[ːˑ̥̃̊]/g, '').toLowerCase();
      return vowels.some(v => clean.includes(v)) || 
             /^[aeiouæɑɛɪɒɔʊʌəɜ]/.test(clean);
    };
    
    const getModalContent = () => {
      let items = [];
      
      switch(type) {
        case 'surface':
          items = Object.entries(stats.surfacePhonemesCounts);
          break;
        case 'elementary':
          items = Object.entries(stats.elementarySegmentsCounts);
          break;
        case 'suprasegmentals':
          items = Object.entries(stats.suprasegmentalCounts);
          break;
        default:
          items = [];
      }

      // Apply filtering for surface phonemes
      if (type === 'surface' && filterType !== 'all') {
        items = items.filter(([phoneme]) => {
          if (filterType === 'vowels') return isVowel(phoneme);
          if (filterType === 'consonants') return !isVowel(phoneme);
          return true;
        });
      }

      // Apply search filter
      items = items.filter(([item]) => 
        item.toLowerCase().includes(localSearchTerm.toLowerCase())
      ).sort(([a], [b]) => a.localeCompare(b));

      const titles = {
        surface: 'Unique Surface Phonemes',
        elementary: 'Unique Elementary Segments',
        suprasegmentals: 'Unique Suprasegmentals'
      };

      return {
        title: titles[type] || '',
        items,
        totalCount: Object.keys(
          type === 'surface' ? stats.surfacePhonemesCounts :
          type === 'elementary' ? stats.elementarySegmentsCounts :
          stats.suprasegmentalCounts
        ).length
      };
    };
    
    const content = getModalContent();
    
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[75vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between flex-shrink-0">
            <h3 className="text-xl font-semibold">{content.title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="px-6 py-4 border-b flex-shrink-0">
            <p className="text-gray-600 mb-3">{content.totalCount} total {type} across all languages</p>
            
            {/* Filter buttons for surface phonemes */}
            {type === 'surface' && (
              <div className="flex space-x-2 mb-3">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 rounded text-sm ${
                    filterType === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  All ({content.totalCount})
                </button>
                <button
                  onClick={() => setFilterType('vowels')}
                  className={`px-3 py-1 rounded text-sm ${
                    filterType === 'vowels' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Vowels
                </button>
                <button
                  onClick={() => setFilterType('consonants')}
                  className={`px-3 py-1 rounded text-sm ${
                    filterType === 'consonants' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Consonants
                </button>
              </div>
            )}
            
            <input
              type="text"
              placeholder="Search segments..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          
          <div className="p-6 overflow-y-auto flex-1">
            {filterType === 'all' || type !== 'surface' ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {content.items.map(([item, count]) => (
                  <div key={item} className="bg-gray-100 px-2 py-1 rounded text-sm text-center">
                    <div className="font-mono">/{item}/</div>
                    <div className="text-xs text-gray-500">
                      ({count} {count === 1 ? 'lang' : 'langs'})
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 mt-8">
                Click "All" to view segments, or use the filter buttons above
              </div>
            )}
            
            {content.items.length === 0 && localSearchTerm && (
              <div className="text-center text-gray-500 mt-4">
                No segments found matching "{localSearchTerm}"
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Language Detail Modal with editing and table/list views - simplified
  const LanguageDetailModal = ({ language, onClose }) => {
    const [localSelectedSegment, setLocalSelectedSegment] = useState(null);
    const [localSelectedFeature, setLocalSelectedFeature] = useState(null);
    const [localFeatureState, setLocalFeatureState] = useState('plus');
    const [viewMode, setViewMode] = useState('list');
    const [editing, setEditing] = useState(null);

    const handleClose = () => {
      setLocalSelectedSegment(null);
      setLocalSelectedFeature(null);
      setLocalFeatureState('plus');
      setEditing(null);
      onClose();
    };

    const handleFeatureClick = (feature) => {
      if (localSelectedFeature === feature) {
        if (localFeatureState === 'plus') {
          setLocalFeatureState('minus');
        } else if (localFeatureState === 'minus') {
          setLocalSelectedFeature(null);
          setLocalFeatureState('plus');
        }
      } else {
        setLocalSelectedFeature(feature);
        setLocalFeatureState('plus');
      }
    };

    const handleSegmentClick = (segment) => {
      setLocalSelectedSegment(localSelectedSegment === segment ? null : segment);
    };

    const getHighlightedSegments = () => {
      if (!localSelectedFeature || !language) return [];
      
      return (language.elementarySegments || []).filter(segment => {
        const segmentFeature = segmentFeatures[segment]?.[localSelectedFeature];
        if (localFeatureState === 'plus') return segmentFeature === '+';
        if (localFeatureState === 'minus') return segmentFeature === '-';
        return false;
      });
    };

    const highlightedSegments = getHighlightedSegments();
    const currentLanguage = editing || language;

    const startEditing = () => setEditing({...language});
    const saveEditing = () => {
      setLanguages(prev => prev.map(lang => 
        lang.id === editing.id ? editing : lang
      ));
      setEditing(null);
    };
    const cancelEditing = () => setEditing(null);

    const updateField = (field, value) => {
      setEditing(prev => ({...prev, [field]: value}));
    };

    const updateMapping = (index, field, value) => {
      setEditing(prev => ({
        ...prev,
        surfaceMappings: prev.surfaceMappings.map((mapping, idx) =>
          idx === index ? {...mapping, [field]: value} : mapping
        )
      }));
    };

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={handleClose}
      >
        <div 
          className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between flex-shrink-0">
            <h3 className="text-xl font-semibold">{currentLanguage.name} Analysis</h3>
            <div className="flex items-center space-x-2">
              {editing ? (
                <>
                  <button
                    onClick={saveEditing}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={startEditing}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                >
                  Edit
                </button>
              )}
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-medium mb-2">Language Information</h4>
                <div className="text-sm space-y-1">
                  <div><strong>Family:</strong> {editing ? 
                    <input
                      value={editing.family}
                      onChange={(e) => updateField('family', e.target.value)}
                      className="ml-2 px-2 py-1 border rounded text-sm"
                    /> : currentLanguage.family
                  }</div>
                  <div><strong>Surface Phonemes:</strong> {currentLanguage.surfacePhonemes?.length || 0}</div>
                  <div><strong>Elementary Segments:</strong> {currentLanguage.elementarySegments?.length || 0}</div>
                  <div><strong>Binary Features:</strong> {currentLanguage.features}</div>
                  <div><strong>Suprasegmentals:</strong> {(currentLanguage.suprasegmentals || []).join(', ') || 'None'}</div>
                  {currentLanguage.dialectNotes && (
                    <div><strong>Dialect Notes:</strong> {editing ?
                      <textarea
                        value={editing.dialectNotes}
                        onChange={(e) => updateField('dialectNotes', e.target.value)}
                        className="ml-2 px-2 py-1 border rounded text-sm w-full"
                        rows="2"
                      /> : currentLanguage.dialectNotes
                    }</div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Elementary Segments (Click to see features)</h4>
                <div className="flex flex-wrap gap-1 mb-4">
                  {(currentLanguage.elementarySegments || []).map(segment => {
                    const isHighlighted = highlightedSegments.includes(segment);
                    return (
                      <button
                        key={segment}
                        onClick={() => handleSegmentClick(segment)}
                        className={`px-2 py-1 rounded text-sm transition-colors ${
                          localSelectedSegment === segment 
                            ? 'bg-blue-500 text-white' 
                            : isHighlighted
                            ? 'bg-yellow-200 text-yellow-800'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                      >
                        /{segment}/
                      </button>
                    );
                  })}
                </div>
                
                {/* Interactive feature display */}
                <div className="bg-gray-50 p-3 rounded">
                  <h5 className="font-medium text-sm mb-2">
                    Binary Features (Click to highlight segments)
                    {localSelectedFeature && (
                      <span className="ml-2 text-xs text-gray-600">
                        Showing {localFeatureState === 'plus' ? '+' : '-'}{localSelectedFeature}
                      </span>
                    )}
                  </h5>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {allBinaryFeatures.map(feature => {
                      const segmentFeature = localSelectedSegment ? segmentFeatures[localSelectedSegment]?.[feature] : null;
                      const isActiveForSegment = segmentFeature && segmentFeature !== '±';
                      const isSelectedFeature = localSelectedFeature === feature;
                      
                      return (
                        <button
                          key={feature}
                          onClick={() => handleFeatureClick(feature)}
                          className={`px-1 py-0.5 rounded transition-colors text-left ${
                            isSelectedFeature
                              ? `bg-yellow-300 text-yellow-900 font-medium`
                              : isActiveForSegment
                              ? 'bg-blue-100 text-blue-800 font-medium hover:bg-blue-200'
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {isActiveForSegment && localSelectedSegment ? `${segmentFeature}${feature}` : feature}
                        </button>
                      );
                    })}
                  </div>
                  {localSelectedSegment ? (
                    <div className="text-xs text-gray-600 mt-2">Features for /{localSelectedSegment}/</div>
                  ) : (
                    <div className="text-xs text-gray-500 mt-2">Click a segment above to see its features, or click features to highlight segments</div>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Surface Mappings ({currentLanguage.surfaceMappings?.length || 0} total)</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 rounded text-sm ${
                      viewMode === 'list' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    List View
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-1 rounded text-sm ${
                      viewMode === 'table' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Table View
                  </button>
                </div>
              </div>
              
              {viewMode === 'list' ? (
                <div className="overflow-x-auto max-h-96">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="sticky top-0 bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Surface</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Elementary</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(currentLanguage.surfaceMappings || []).map((mapping, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-sm font-mono">
                            {editing ? (
                              <input
                                value={mapping.surface}
                                onChange={(e) => updateMapping(idx, 'surface', e.target.value)}
                                className="px-2 py-1 border rounded text-sm font-mono w-full"
                              />
                            ) : `/${mapping.surface}/`}
                          </td>
                          <td className="px-3 py-2 text-sm font-mono">
                            {editing ? (
                              <input
                                value={mapping.elementary}
                                onChange={(e) => updateMapping(idx, 'elementary', e.target.value)}
                                className="px-2 py-1 border rounded text-sm font-mono w-full"
                              />
                            ) : `/${mapping.elementary}/`}
                          </td>
                          <td className="px-3 py-2 text-sm">
                            {editing ? (
                              <input
                                value={mapping.notes || mapping.rule || ''}
                                onChange={(e) => updateMapping(idx, 'notes', e.target.value)}
                                className="px-2 py-1 border rounded text-sm w-full"
                              />
                            ) : (mapping.notes || mapping.rule)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  <div>
                    <h5 className="font-medium mb-2">Surface Inventory</h5>
                    <div className="grid grid-cols-6 gap-1 p-3 bg-gray-50 rounded">
                      {(currentLanguage.surfacePhonemes || []).map(phoneme => (
                        <div key={phoneme} className="text-center text-sm font-mono bg-white p-1 rounded">
                          /{phoneme}/
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Elementary Inventory</h5>
                    <div className="grid grid-cols-4 gap-1 p-3 bg-gray-50 rounded">
                      {(currentLanguage.elementarySegments || []).map(segment => (
                        <div key={segment} className="text-center text-sm font-mono bg-white p-1 rounded">
                          /{segment}/
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Comprehensive Phonemic Analysis System
        </h1>
        <p className="text-gray-600">
          Systematic decomposition, validation, and cross-linguistic comparison of phonemic inventories
        </p>
      </div>

      <div className="mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: Database },
            { id: 'validation', name: 'Validation', icon: CheckCircle },
            { id: 'comparison', name: 'Comparison', icon: BarChart3 },
            { id: 'import', name: 'Import', icon: Upload }
          ].map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {name}
            </button>
          ))}
        </nav>
      </div>

      <div className="min-h-[600px]">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'validation' && <ValidationTab />}
        {activeTab === 'comparison' && <ComparisonTab />}
        {activeTab === 'import' && <ImportTab />}
      </div>

      {selectedOverview && (
        <OverviewDetailModal
          type={selectedOverview}
          onClose={() => setSelectedOverview(null)}
        />
      )}

      {selectedLanguage && (
        <LanguageDetailModal
          language={selectedLanguage}
          onClose={() => setSelectedLanguage(null)}
        />
      )}
    </div>
  );
};

export default ComprehensivePhonemicSystem;