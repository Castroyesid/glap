import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Database, CheckCircle, XCircle, Map, BarChart3, FileText, Upload, Download, Eye, Edit2, Save, X, Trash2 } from 'lucide-react';

const ComprehensivePhonemicSystem = () => {
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedOverview, setSelectedOverview] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [validationResults, setValidationResults] = useState({});
  const [csvData, setCsvData] = useState(null);
  const [columnMapping, setColumnMapping] = useState({});
  const [importStep, setImportStep] = useState('upload');
  const [showAddLanguage, setShowAddLanguage] = useState(false);
  const [newLanguage, setNewLanguage] = useState({
    name: '',
    family: '',
    coordinates: [0, 0],
    surfacePhonemes: [],
    elementarySegments: [],
    suprasegmentals: [],
    features: 0,
    surfaceMappings: []
  });

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
  
  // Feature specifications for elementary segments
  const [segmentFeatures, setSegmentFeatures] = useState({
    // Rotokas
    'a': { high: '-', front: '±', occlusive: '±', consonantal: '-' },
    'ə': { high: '+', front: '±', occlusive: '±', consonantal: '-' },
    'w': { high: '±', front: '±', occlusive: '±', consonantal: '+' },
    'j': { high: '±', front: '+', occlusive: '±', consonantal: '+' },
    'k': { high: '±', front: '-', occlusive: '+', consonantal: '+' },
    // Hawaiian
    'ʔ': { high: '±', front: '-', voice: '-', occlusive: '+', consonantal: '+' },
    'h': { high: '±', front: '-', voice: '-', occlusive: '-', consonantal: '+' },
    // English vowels
    'i': { high: '+', low: '-', front: '+', consonantal: '-' },
    'e': { high: '-', low: '-', front: '+', consonantal: '-' },
    'æ': { high: '-', low: '+', front: '+', consonantal: '-' },
    'u': { high: '+', low: '-', front: '-', consonantal: '-' },
    'o': { high: '-', low: '-', front: '-', consonantal: '-' },
    'ɒ': { high: '-', low: '+', front: '-', consonantal: '-' },
    // English consonants
    'θ': { high: '±', low: '±', front: '+', occlusive: '-', consonantal: '+' },
    'l': { high: '±', low: '±', front: '+', occlusive: '-', consonantal: '±' },
    'r': { high: '±', low: '±', front: '+', occlusive: '-', consonantal: '±' },
    'n': { high: '±', low: '±', front: '±', nasal: '+', consonantal: '±' }
  });

  // All possible binary features for display
  const allBinaryFeatures = ['high', 'low', 'front', 'voice', 'occlusive', 'nasal', 'consonantal', 'obstruent'];

  // Core language data
  const languageData = {
    rotokas: {
      id: 1,
      name: "Rotokas",
      family: "North Bougainville", 
      coordinates: [-6.2, 155.2],
      surfacePhonemes: [
        "p", "t", "k", "b", "d", "g", "m", "n", "ŋ",
        "a", "e", "i", "o", "u", "aː", "eː", "iː", "oː", "uː"
      ],
      elementarySegments: ["a", "ə", "w", "j", "k"],
      suprasegmentals: ["length"],
      features: 4,
      dialectNotes: "Long vowels phonemic in Central Rotokas only; nasal consonants phonemic in Aita Rotokas only",
      surfaceMappings: [
        { surface: "p", elementary: "wk", notes: "Ck = voiceless consonant" },
        { surface: "t", elementary: "jk", notes: "Ck = voiceless consonant" },
        { surface: "k", elementary: "kk", notes: "Ck = voiceless consonant" },
        { surface: "b", elementary: "w", notes: "voiced, underlyingly nasal" },
        { surface: "d", elementary: "j", notes: "voiced, underlyingly nasal" },
        { surface: "g", elementary: "k", notes: "voiced, underlyingly nasal" },
        { surface: "m", elementary: "wkw", notes: "nasal due to underlyingly nasal w (Aita Rotokas only)" },
        { surface: "n", elementary: "jkj", notes: "nasal due to underlyingly nasal j (Aita Rotokas only)" },
        { surface: "ŋ", elementary: "kkj", notes: "nasal due to underlyingly nasal j (Aita Rotokas only)" },
        { surface: "a", elementary: "a", notes: "low vowel elementary" },
        { surface: "e", elementary: "ə", notes: "high vowel elementary" },
        { surface: "i", elementary: "əj", notes: "high (ə) + front (j)" },
        { surface: "o", elementary: "aw", notes: "mid (a) + back (w)" },
        { surface: "u", elementary: "əw", notes: "high (ə) + back (w)" },
        { surface: "aː", elementary: "a:", notes: "low vowel + length" },
        { surface: "eː", elementary: "ə:", notes: "high vowel + length" },
        { surface: "iː", elementary: "əj:", notes: "high (ə) + front (j) + length" },
        { surface: "oː", elementary: "aw:", notes: "mid (a) + back (w) + length" },
        { surface: "uː", elementary: "əw:", notes: "high (ə) + back (w) + length" }
      ]
    },
    hawaiian: {
      id: 2,
      name: "Hawaiian",
      family: "Austronesian > Oceanic",
      coordinates: [21.3, -157.8], 
      surfacePhonemes: [
        "m", "n", "l", "p", "t", "ʔ", "h", "w",
        "i", "iː", "u", "uː", "e", "eː", "a", "aː", "o", "oː", 
        "iu", "ou", "oi", "eu", "ei", "au", "ai", "ao", "ae",
        "oːu", "eːi", "aːu", "aːi", "aːo", "aːe"
      ],
      elementarySegments: ["a", "ə", "w", "j", "ʔ", "h"],
      suprasegmentals: ["length"],
      features: 4,
      surfaceMappings: [
        { surface: "m", elementary: "ʔw", notes: "ʔw = nasal (no h marker)" },
        { surface: "n", elementary: "ʔj", notes: "ʔj = nasal (no h marker)" },
        { surface: "p", elementary: "ʔwh", notes: "ʔwh = voiceless stop" },
        { surface: "t", elementary: "ʔjh", notes: "ʔjh = voiceless stop" },
        { surface: "l", elementary: "jh", notes: "jh = lateral" },
        { surface: "ʔ", elementary: "ʔ", notes: "elementary segment" },
        { surface: "h", elementary: "h", notes: "elementary segment" },
        { surface: "w", elementary: "w", notes: "elementary segment" },
        { surface: "a", elementary: "a", notes: "elementary vowel" },
        { surface: "e", elementary: "ə", notes: "elementary vowel" },
        { surface: "i", elementary: "əj", notes: "high front = ə + j" },
        { surface: "o", elementary: "aw", notes: "mid back = a + w" },
        { surface: "u", elementary: "əw", notes: "high back = ə + w" }
      ]
    },
    english: {
      id: 3,
      name: "English",
      family: "Indo-European > Germanic",
      coordinates: [52.0, -1.0],
      surfacePhonemes: ["ɪ", "ɛ", "æ", "ʊ", "ʌ", "ɒ"],
      elementarySegments: ["i", "e", "æ", "u", "o", "ɒ", "r", "j", "w"],
      suprasegmentals: ["stress"],
      features: 7,
      surfaceMappings: [
        { surface: "ɪ", elementary: "i", notes: "elementary; KIT vowel" },
        { surface: "ɛ", elementary: "e", notes: "elementary; DRESS vowel" },
        { surface: "æ", elementary: "æ", notes: "elementary; TRAP vowel" },
        { surface: "ʊ", elementary: "u", notes: "elementary; FOOT vowel" },
        { surface: "ʌ", elementary: "o", notes: "elementary; STRUT vowel" },
        { surface: "ɒ", elementary: "ɒ", notes: "elementary; LOT vowel" },
        { surface: "ə", elementary: "r", notes: "commA vowel; not necessarily phonemic, usually analyzed as one of very few underlying vowels that surface in open syllables, if analyzed as a separate phoneme at all"},
        { surface: "ər", elementary: "rr", notes: "lettER vowel; not necessarily a single phoneme, usually analyzed as a /Vr/ cluster"},
        { surface: "i", elementary: "j", notes: "happY vowel; marginal, not necessarily phonemic, usually analyzed as one of very few underlying vowels that surface in open syllables, if analyzed as a separate phoneme at all"}, 
        { surface: "iː", elementary: "ij", notes: "FLEECE vowel" },
        { surface: "eɪ", elementary: "ej", notes: "FACE vowel" },
        { surface: "æː", elementary: "æj", notes: "BATH vowel" },
        { surface: "ɔɪ", elementary: "uj", notes: "CHOICE vowel" },
        { surface: "aɪ", elementary: "oj", notes: "PRICE vowel" },
        { surface: "ɑː", elementary: "ɒj", notes: "PALM vowel" },
        { surface: "aʊ", elementary: "ew", notes: "MOUTH vowel" },
        { surface: "ɒː", elementary: "æw", notes: "CLOTH vowel" }, 
        { surface: "uː", elementary: "uw", notes: "GOOSE vowel" },
        { surface: "əʊ", elementary: "ow", notes: "GOAT vowel" },
        { surface: "ɔː", elementary: "ɒw", notes: "THOUGHT vowel" },
        { surface: "ɪə", elementary: "ir", notes: "NEAR vowel" },
        { surface: "ɛː", elementary: "er", notes: "SQUARE vowel" },
        { surface: "ɑː", elementary: "ær", notes: "START vowel" },
        { surface: "ʊə", elementary: "ur", notes: "CURE vowel" },
        { surface: "ɔː", elementary: "or", notes: "FORCE vowel" },
        { surface: "ɒː", elementary: "ɒr", notes: "NORTH vowel" },
        { surface: "ɜː", elementary: "jr", notes: "NURSE vowel; curl-coil merger" },
        { surface: "j", elementary: "j", notes: "oral dorsal continuant; palatal approximant" },
        { surface: "w", elementary: "w", notes: "oral labial continuant; labiovelar approximant" },
        { surface: "m", elementary: "wn", notes: "oral labial continuant (w) + voiced nasal (n); alternatively: /wʔn/" },
        { surface: "n", elementary: "jn", notes: "oral dorsal continuant (j) + voiced nasal (n); alternatively: /jʔn/" },
        { surface: "ŋ", elementary: "n", notes: "nasal; marginal" },
        { surface: "p", elementary: "wʔ", notes: "oral labial continuant (w) + voiceless oral stop (ʔ)" },
        { surface: "t", elementary: "ʔ", notes: "elementary; voiceless oral stop (ʔ)" },
        { surface: "tʃ", elementary: "ʔj", notes: "voiceless oral stop (ʔ) + oral dorsal continuant (j)" },
        { surface: "k", elementary: "jʔ", notes: "oral dorsal continuant (j) + oral voiceless stop (ʔ)" },
        { surface: "ʔ", elementary: "ʔʔ", notes: "marginal" },
        { surface: "b", elementary: "nw", notes: "voiced nasal (n) + oral labial continuant (w); alternatively: /nwʔ/; /nʔw/" },
        { surface: "d", elementary: "nj", notes: "voiced nasal (n) + oral dorsal continuan (j); alternatively: /njʔ/" },
        { surface: "dʒ", elementary: "nʔj", notes: "voiced nasal (n) + voiceless oral stop (ʔ) + oral dorsal continuant (j)" },
        { surface: "g", elementary: "nʔ", notes: "voiced nasal (n) + voiceless oral stop (ʔ)" },
        { surface: "f", elementary: "wθ", notes: "oral labial continuant (w) + voiceless oral continuant (θ)" },
        { surface: "θ", elementary: "θ", notes: "elementary; voiceless oral continuant (θ); not phonemic in all varieties" },
        { surface: "s", elementary: "lθ", notes: "oral lateral continuant (l) + voiceless oral continuant (θ); alternatively: /l/ if /l/ maps to /ll/;" },
        { surface: "ʃ", elementary: "jθ", notes: "oral dorsal continuant (j) + voiceless oral continuant (θ); alternatively: /jl/ if /s/ maps to /l/; /jlθ/; marginal" },
        { surface: "x", elementary: "ʔjθ", notes: "voiceless oral stop (ʔ) + oral dorsal continuant (j) + voiceless oral continuant (θ); alternatively: /ʔθj/; /jθ/ if /ʃ/ maps to /jl/; marginal" },
        { surface: "h", elementary: "ʔθ", notes: "voiceless oral stop (ʔ) + voiceless oral continuant (θ)" },
        { surface: "v", elementary: "nθw", notes: "voiced nasal (n) + voiceless oral continuant (θ) + oral labial continuant (w)" },
        { surface: "ð", elementary: "nθ", notes: "voiced nasal (n) + voiceless oral continuant (θ); not phonemic in all varieties" },
        { surface: "z", elementary: "nl", notes: "voiced nasal (n) + oral lateral continuant (l); alternatively: /nlθ/" },
        { surface: "ʒ", elementary: "nlj", notes: "voiced nasal (n) + oral lateral consonant (l) + oral dorsal continuant (j); alternatively: /njlθ/; marginal" },
        { surface: "l", elementary: "l", notes: "elementary; alternatively: /ll/ if /s/ maps to /l/" },
      ]
    }
  };

  useEffect(() => {
    // Always use the data from  code, ignore localStorage
    setLanguages(Object.values(languageData));
  }, []
  );

  // Save to localStorage whenever languages change
  useEffect(() => {
    if (languages.length > 0) {
      localStorage.setItem('phonenicAnalysisLanguages', JSON.stringify(languages));
    }
  }, [languages]);

  // Add new language
  const addNewLanguage = () => {
    const id = Math.max(...languages.map(l => l.id), 0) + 1;
    const languageToAdd = {
      ...newLanguage,
      id,
      surfacePhonemes: typeof newLanguage.surfacePhonemes === 'string' 
        ? newLanguage.surfacePhonemes.split(/[,\s]+/).filter(p => p.trim())
        : newLanguage.surfacePhonemes,
      elementarySegments: typeof newLanguage.elementarySegments === 'string'
        ? newLanguage.elementarySegments.split(/[,\s]+/).filter(s => s.trim())
        : newLanguage.elementarySegments,
      suprasegmentals: typeof newLanguage.suprasegmentals === 'string'
        ? newLanguage.suprasegmentals.split(/[,\s]+/).filter(s => s.trim())
        : newLanguage.suprasegmentals,
      surfaceMappings: newLanguage.surfaceMappings || [],
      dialectNotes: ''
    };
    
    setLanguages(prev => [...prev, languageToAdd]);
    setNewLanguage({
      name: '',
      family: '',
      coordinates: [0, 0],
      surfacePhonemes: [],
      elementarySegments: [],
      suprasegmentals: [],
      features: 0,
      surfaceMappings: []
    });
    setShowAddLanguage(false);
  };

  // Delete language with confirmation
  const deleteLanguage = (id) => {
    if (window.confirm('Are you sure you want to delete this language? This action cannot be undone.')) {
      setLanguages(prev => prev.filter(lang => lang.id !== id));
      if (selectedLanguage && selectedLanguage.id === id) {
        setSelectedLanguage(null);
      }
    }
  };

  // Validation logic
  const validateLanguage = (language) => {
    const results = {};
    
    const mappedSurface = new Set(language.surfaceMappings.map(m => m.surface));
    const unmappedPhonemes = language.surfacePhonemes.filter(p => !mappedSurface.has(p));
    
    results.completeness = {
      passed: unmappedPhonemes.length === 0,
      message: unmappedPhonemes.length === 0 
        ? "All surface phonemes have elementary mappings"
        : `Unmapped phonemes: ${unmappedPhonemes.join(', ')}`,
      details: unmappedPhonemes
    };

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
  }, []
);

  const exportTemplate = () => {
    const template = `language_name,language_family,iso_code,latitude,longitude,surface_phonemes,elementary_segments,suprasegmentals,surface_count,elementary_count
Rotokas,North Bougainville,roo,-6.2,155.2,"p t k b d g m n ŋ a e i o u aː eː iː oː uː","a ə w j k",length,19,5
Hawaiian,Austronesian,haw,21.3,-157.8,"m n l p t ʔ h w i iː u uː e eː a aː o oː iu ou oi eu ei au ai ao ae oːu eːi aːu aːi aːo aːe","a ə w j ʔ h",length,33,6
English,Indo-European,en,52.0,-1.0,"ɪ ɛ æ ʊ ʌ ɒ","i e æ u o ɒ",length,6,6`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'phonemic_analysis_template.csv';
    a.click();
  };

  // Add Language Modal
  const AddLanguageModal = () => (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={() => setShowAddLanguage(false)}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-xl font-semibold">Add New Language</h3>
          <p className="text-gray-600 text-sm">Enter phonemic analysis data for a new language</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language Name</label>
              <input
                type="text"
                value={newLanguage.name}
                onChange={(e) => setNewLanguage(prev => ({...prev, name: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Mandarin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language Family</label>
              <input
                type="text"
                value={newLanguage.family}
                onChange={(e) => setNewLanguage(prev => ({...prev, family: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Sino-Tibetan"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Features Count</label>
              <input
                type="number"
                value={newLanguage.features}
                onChange={(e) => setNewLanguage(prev => ({...prev, features: parseInt(e.target.value) || 0}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Coordinates (lat, long)</label>
              <div className="flex space-x-1">
                <input
                  type="number"
                  value={newLanguage.coordinates[0]}
                  onChange={(e) => setNewLanguage(prev => ({
                    ...prev, 
                    coordinates: [parseFloat(e.target.value) || 0, prev.coordinates[1]]
                  }))}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Lat"
                />
                <input
                  type="number"
                  value={newLanguage.coordinates[1]}
                  onChange={(e) => setNewLanguage(prev => ({
                    ...prev,
                    coordinates: [prev.coordinates[0], parseFloat(e.target.value) || 0]
                  }))}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Long"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Surface Phonemes</label>
            <textarea
              value={Array.isArray(newLanguage.surfacePhonemes) ? newLanguage.surfacePhonemes.join(' ') : newLanguage.surfacePhonemes}
              onChange={(e) => setNewLanguage(prev => ({...prev, surfacePhonemes: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="p t k b d g m n ŋ a e i o u (space or comma separated)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Elementary Segments</label>
            <textarea
              value={Array.isArray(newLanguage.elementarySegments) ? newLanguage.elementarySegments.join(' ') : newLanguage.elementarySegments}
              onChange={(e) => setNewLanguage(prev => ({...prev, elementarySegments: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="2"
              placeholder="a ə w j k (space or comma separated)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Suprasegmentals</label>
            <input
              type="text"
              value={Array.isArray(newLanguage.suprasegmentals) ? newLanguage.suprasegmentals.join(', ') : newLanguage.suprasegmentals}
              onChange={(e) => setNewLanguage(prev => ({...prev, suprasegmentals: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="length, tone (comma separated)"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              onClick={() => setShowAddLanguage(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={addNewLanguage}
              disabled={!newLanguage.name.trim() || !newLanguage.family.trim()}
              className="px-6 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Language
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Language Detail Modal
  const LanguageDetailModal = ({ language, onClose }) => {
    const [localSelectedSegment, setLocalSelectedSegment] = useState(null);
    const [localSelectedFeature, setLocalSelectedFeature] = useState(null);
    const [localFeatureState, setLocalFeatureState] = useState('plus');
    const [viewMode, setViewMode] = useState('list');
    const [editing, setEditing] = useState(null);
    const [newMapping, setNewMapping] = useState({ surface: '', elementary: '', notes: '' });
    const [showAddMapping, setShowAddMapping] = useState(false);
    const [editingFeatures, setEditingFeatures] = useState(false);

    const handleClose = () => {
      setLocalSelectedSegment(null);
      setLocalSelectedFeature(null);
      setLocalFeatureState('plus');
      setEditing(null);
      setNewMapping({ surface: '', elementary: '', notes: '' });
      setShowAddMapping(false);
      setEditingFeatures(false);
      onClose();
    };

    // Get which features are actually used by this language's segments
    const getUsedFeatures = () => {
      const usedFeatures = new Set();
      (language.elementarySegments || []).forEach(segment => {
        const features = segmentFeatures[segment];
        if (features) {
          Object.entries(features).forEach(([feature, value]) => {
            if (value === '+' || value === '-' || value === '±') {
              usedFeatures.add(feature);
            }
          });
        }
      });
      return usedFeatures;
    };

    const usedFeatures = getUsedFeatures();

    const handleFeatureClick = (feature) => {
      if (!usedFeatures.has(feature)) return;
      
      setLocalSelectedSegment(null);
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
      setLocalSelectedFeature(null);
      setLocalFeatureState('plus');
      setLocalSelectedSegment(localSelectedSegment === segment ? null : segment);
    };

    const getHighlightedSegments = () => {
      if (!localSelectedFeature || !usedFeatures.has(localSelectedFeature)) return [];
      
      return (language.elementarySegments || []).filter(segment => {
        const segmentFeature = segmentFeatures[segment]?.[localSelectedFeature];
        if (localFeatureState === 'plus') return segmentFeature === '+' || segmentFeature === '±';
        if (localFeatureState === 'minus') return segmentFeature === '-' || segmentFeature === '±';
        return false;
      });
    };

    const getSegmentHighlightColor = () => {
      if (!localSelectedFeature) return '';
      if (localFeatureState === 'plus') return 'bg-green-200 text-green-900 border border-green-300';
      if (localFeatureState === 'minus') return 'bg-red-200 text-red-900 border border-red-300';
      return 'bg-gray-200 text-gray-900 border border-gray-300';
    };

    const getShowingTextColor = () => {
      if (!localSelectedFeature) return '';
      if (localFeatureState === 'plus') return 'bg-green-100 text-green-800';
      if (localFeatureState === 'minus') return 'bg-red-100 text-red-800';
      return 'bg-gray-100 text-gray-800';
    };

    const highlightedSegments = getHighlightedSegments();
    const currentLanguage = editing || language;

    const startEditing = () => {
      const editingLang = {...language};
      if (!editingLang.dialectNotes) {
        editingLang.dialectNotes = '';
      }
      setEditing(editingLang);
    };
    
    const saveEditing = () => {
      setLanguages(prev => prev.map(lang => 
        lang.id === editing.id ? editing : lang
      ));
      setEditing(null);
      setSelectedLanguage(editing);
    };

    const cancelEditing = () => setEditing(null);

    const updateField = (field, value) => {
      setEditing(prev => ({...prev, [field]: value}));
    };

    const updateSurfacePhonemes = (value) => {
      const surfacePhonemes = typeof value === 'string' 
        ? value.split(/[,\s]+/).filter(p => p.trim())
        : value;
      setEditing(prev => ({...prev, surfacePhonemes}));
    };

    const updateSuprasegmentals = (value) => {
      const suprasegmentals = typeof value === 'string'  
        ? value.split(',').map(s => s.trim()).filter(s => s)  // ← Fixed: only splits on commas
        : value;
      setEditing(prev => ({...prev, suprasegmentals}));
    };

    const autoGenerateMappings = () => {
      if (!editing) return;
      const existingMappings = new Set(editing.surfaceMappings.map(m => m.surface));
      const newMappings = editing.surfacePhonemes
        .filter(phoneme => !existingMappings.has(phoneme))
        .map(phoneme => ({ surface: phoneme, elementary: '', notes: '' }));
      
      if (newMappings.length > 0) {
        setEditing(prev => ({
          ...prev,
          surfaceMappings: [...prev.surfaceMappings, ...newMappings]
        }));
      }
    };

    const updateMapping = (index, field, value) => {
      setEditing(prev => ({
        ...prev,
        surfaceMappings: prev.surfaceMappings.map((mapping, idx) =>
          idx === index ? {...mapping, [field]: value} : mapping
        )
      }));
    };

    const addMapping = () => {
      if (!newMapping.surface.trim() || !newMapping.elementary.trim()) return;
      
      setEditing(prev => ({
        ...prev,
        surfaceMappings: [...(prev.surfaceMappings || []), { ...newMapping }]
      }));
      setNewMapping({ surface: '', elementary: '', notes: '' });
      setShowAddMapping(false);
    };

    const deleteMapping = (index) => {
      setEditing(prev => ({
        ...prev,
        surfaceMappings: prev.surfaceMappings.filter((_, idx) => idx !== index)
      }));
    };

    const updateSegmentFeature = (segment, feature, value) => {
      // Only update if we're in editing mode and have a selected segment
      if (!editing || !localSelectedSegment) return;
  
      setSegmentFeatures(prev => ({
        ...prev,
        [segment]: {
          ...prev[segment],
          [feature]: value
        }
      }));
    };

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={handleClose}
      >
        <div 
          className="bg-white rounded-xl shadow-2xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-xl flex items-center justify-between flex-shrink-0">
            <h3 className="text-xl font-semibold">{currentLanguage.name} Analysis</h3>
            <div className="flex items-center space-x-3">
              <button onClick={handleClose}>
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1">
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Language Information</h4>
                  <div className="text-sm space-y-3">
                    <div className="flex items-center">
                      <strong className="text-gray-700 w-32">Family:</strong> 
                      {editing ? 
                        <input
                          value={editing.family}
                          onChange={(e) => updateField('family', e.target.value)}
                          className="ml-2 px-3 py-1 border border-gray-300 rounded-lg text-sm flex-1 focus:ring-2 focus:ring-blue-500"
                        /> : 
                        <span className="text-gray-900">{currentLanguage.family}</span>
                      }
                    </div>
                    
                    <div className="flex items-center">
                      <strong className="text-gray-700 w-32">Surface Phonemes:</strong> 
                      {editing ? (
                        <div className="ml-2 flex-1">
                          <textarea
                            value={Array.isArray(editing.surfacePhonemes) ? editing.surfacePhonemes.join(' ') : editing.surfacePhonemes || ''}
                            onChange={(e) => updateSurfacePhonemes(e.target.value)}
                            className="w-full px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            rows="2"
                            placeholder="ɪ ɛ æ ʊ ʌ ɒ (space separated)"
                          />
                          <div className="text-xs text-gray-500 mt-1">Count: {editing.surfacePhonemes?.length || 0}</div>
                        </div>
                      ) : (
                        <span className="text-blue-600 font-semibold">{currentLanguage.surfacePhonemes?.length || 0}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      <strong className="text-gray-700 w-32">Elementary Segments:</strong> 
                      {editing ? (
                        <div className="ml-2 flex-1">
                          <input
                            value={Array.isArray(editing.elementarySegments) ? editing.elementarySegments.join(' ') : editing.elementarySegments || ''}
                            onChange={(e) => setEditing(prev => ({
                              ...prev,
                              elementarySegments: e.target.value.split(/[,\s]+/).filter(s => s.trim())
                            }))}
                            className="w-full px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="i e æ u o ɑ (space separated)"
                          />
                          <div className="text-xs text-gray-500 mt-1">Count: {editing.elementarySegments?.length || 0}</div>
                        </div>
                      ) : (
                        <span className="text-purple-600 font-semibold">{currentLanguage.elementarySegments?.length || 0}</span>
                      )}
                    </div>
                    
                    <div><strong className="text-gray-700">Binary Features:</strong> <span className="text-green-600 font-semibold">{currentLanguage.features}</span></div>
                    
                    <div className="flex items-start">
                      <strong className="text-gray-700 w-32 flex-shrink-0">Suprasegmentals:</strong>
                      {editing ? (
                        <input
                          value={Array.isArray(editing.suprasegmentals) ? editing.suprasegmentals.join(', ') : editing.suprasegmentals || ''}
                          onChange={(e) => updateSuprasegmentals(e.target.value)}
                          className="ml-2 px-3 py-1 border border-gray-300 rounded-lg text-sm flex-1 focus:ring-2 focus:ring-blue-500"
                          placeholder="length, tone (comma separated)"
                        />
                      ) : (
                        <span className="font-mono ml-2">{(currentLanguage.suprasegmentals || []).join(', ') || 'None'}</span>
                      )}
                    </div>
                    
                    <div className="pt-2">
                      <strong className="text-gray-700">Notes:</strong> 
                      {editing ?
                        <textarea
                          value={editing.dialectNotes || ''}
                          onChange={(e) => updateField('dialectNotes', e.target.value)}
                          className="ml-2 px-3 py-2 border border-gray-300 rounded-lg text-sm w-full mt-1 focus:ring-2 focus:ring-blue-500"
                          rows="3"
                          placeholder="Add notes about this language analysis..."
                        /> : 
                        <p className="text-gray-600 mt-1">{currentLanguage.dialectNotes || 'No notes added yet.'}</p>
                      }
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Elementary Segments (Click to see features)</h4>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {(currentLanguage.elementarySegments || []).map(segment => {
                      const isHighlighted = highlightedSegments.includes(segment);
                      const highlightClass = isHighlighted ? getSegmentHighlightColor() : '';
                      return (
                        <button
                          key={segment}
                          onClick={() => handleSegmentClick(segment)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all shadow-sm ${
                            localSelectedSegment === segment 
                              ? 'bg-blue-500 text-white shadow-md' 
                              : isHighlighted
                              ? highlightClass
                              : 'bg-purple-100 text-purple-800 hover:bg-purple-200 border border-purple-200'
                          }`}
                        >
                          /{segment}/
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h5 className="font-medium text-sm mb-3 text-gray-900">
                      Binary Features (Click to highlight segments)
                      {localSelectedFeature && usedFeatures.has(localSelectedFeature) && (
                        <span className={`ml-2 text-xs px-2 py-1 rounded ${getShowingTextColor()}`}>
                          Showing {localFeatureState === 'plus' ? '+' : '-'}{localSelectedFeature}
                        </span>
                      )}
                      {editing && (
                        <button
                          onClick={() => setEditingFeatures(!editingFeatures)}
                          className="ml-4 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                        >
                          {editingFeatures ? 'Done Editing' : 'Edit Features'}
                        </button>
                      )}
                    </h5>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {allBinaryFeatures.map(feature => {
                        const segmentFeature = localSelectedSegment ? segmentFeatures[localSelectedSegment]?.[feature] : null;
                        const isActiveForSegment = segmentFeature && segmentFeature !== '±';
                        const isSelectedFeature = localSelectedFeature === feature;
                        const isFeatureUsed = usedFeatures.has(feature);
                        
                        const getFeatureColor = () => {
                          if (!isFeatureUsed) return 'text-gray-400 cursor-not-allowed bg-gray-100';
                          if (isSelectedFeature) {
                            if (localFeatureState === 'plus') return 'bg-green-200 text-green-800 border border-green-300';
                            if (localFeatureState === 'minus') return 'bg-red-200 text-red-800 border border-red-300';
                            return 'bg-gray-200 text-gray-800 border border-gray-300';
                          }
                          if (isActiveForSegment && localSelectedSegment) {
                            if (segmentFeature === '+') return 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-200';
                            if (segmentFeature === '-') return 'bg-red-100 text-red-800 hover:bg-red-200 border border-red-200';
                            if (segmentFeature === '±') return 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300';
                          }
                          return 'text-gray-700 hover:text-gray-900 hover:bg-gray-200 bg-gray-100 border border-gray-200';
                        };
                        
                        return (
                          <div key={feature} className="flex items-center">
                            <button
                              onClick={() => isFeatureUsed ? handleFeatureClick(feature) : null}
                              disabled={!isFeatureUsed}
                              className={`px-2 py-1 rounded-md transition-all text-left font-medium flex-1 ${getFeatureColor()}`}
                            >
                              {isActiveForSegment && localSelectedSegment ? `${segmentFeature}${feature}` : feature}
                            </button>
                            {editingFeatures && editing && localSelectedSegment && (
                              <select
                                value={segmentFeatures[localSelectedSegment]?.[feature] || ''}
                                onChange={(e) => updateSegmentFeature(localSelectedSegment, feature, e.target.value)}
                                className="ml-1 text-xs border rounded px-1"
                              >
                                <option value="">—</option>
                                <option value="+">+</option>
                                <option value="-">-</option>
                                <option value="±">±</option>
                              </select>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-xs text-gray-500 mt-3 p-2 bg-gray-50 rounded">
                      {localSelectedSegment ? 
                        `Features for /${localSelectedSegment}/` : 
                        "Click a segment above to see its features, or click features to highlight segments"
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 rounded-t-xl">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Surface Mappings ({currentLanguage.surfaceMappings?.length || 0} total)</h4>
                  <div className="flex items-center space-x-3">
                    {editing && (
                      <>
                        <button
                          onClick={autoGenerateMappings}
                          className="flex items-center px-3 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors"
                        >
                          Auto-Generate Missing
                        </button>
                        <button
                          onClick={() => setShowAddMapping(true)}
                          className="flex items-center px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Mapping
                        </button>
                      </>
                    )}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          viewMode === 'list' 
                            ? 'bg-blue-500 text-white shadow-md' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        List View
                      </button>
                      <button
                        onClick={() => setViewMode('table')}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          viewMode === 'table' 
                            ? 'bg-blue-500 text-white shadow-md' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Grid View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {viewMode === 'list' ? (
                  <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="sticky top-0 bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Surface</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Elementary</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                          {editing && (
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {(currentLanguage.surfaceMappings || []).map((mapping, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-sm font-mono">
                              {editing ? (
                                <input
                                  value={mapping.surface}
                                  onChange={(e) => updateMapping(idx, 'surface', e.target.value)}
                                  className="px-2 py-1 border border-gray-300 rounded text-sm font-mono w-full focus:ring-2 focus:ring-blue-500"
                                />
                              ) : (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">/{mapping.surface}/</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm font-mono">
                              {editing ? (
                                <input
                                  value={mapping.elementary}
                                  onChange={(e) => updateMapping(idx, 'elementary', e.target.value)}
                                  className="px-2 py-1 border border-gray-300 rounded text-sm font-mono w-full focus:ring-2 focus:ring-blue-500"
                                />
                              ) : (
                                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">/{mapping.elementary}/</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-right">
                              {editing ? (
                                <input
                                  value={mapping.notes || mapping.rule || ''}
                                  onChange={(e) => updateMapping(idx, 'notes', e.target.value)}
                                  className="px-2 py-1 border border-gray-300 rounded text-sm w-full focus:ring-2 focus:ring-blue-500"
                                />
                              ) : (
                                <span className="text-gray-600">{mapping.notes || mapping.rule}</span>
                              )}
                            </td>
                            {editing && (
                              <td className="px-4 py-3 text-sm text-right">
                                <button
                                  onClick={() => deleteMapping(idx)}
                                  className="text-red-600 hover:text-red-800 font-medium"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-96 overflow-y-auto">
                    <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-lg border border-blue-200">
                      <h5 className="font-medium mb-3 text-blue-900">Surface Inventory</h5>
                      <div className="grid grid-cols-6 gap-2">
                        {(currentLanguage.surfacePhonemes || []).map(phoneme => (
                          <div key={phoneme} className="text-center text-sm font-mono bg-white p-2 rounded border border-blue-200 shadow-sm">
                            /{phoneme}/
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-lg border border-purple-200">
                      <h5 className="font-medium mb-3 text-purple-900">Elementary Inventory</h5>
                      <div className="grid grid-cols-4 gap-2">
                        {(currentLanguage.elementarySegments || []).map(segment => (
                          <div key={segment} className="text-center text-sm font-mono bg-white p-2 rounded border border-purple-200 shadow-sm">
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

        {/* Add Mapping Modal */}
        {showAddMapping && editing && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60"
            onClick={() => setShowAddMapping(false)}
          >
            <div 
              className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 bg-gray-50 border-b rounded-t-lg">
                <h4 className="text-lg font-semibold text-gray-900">Add Surface Mapping</h4>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Surface Phoneme</label>
                  <input
                    type="text"
                    value={newMapping.surface}
                    onChange={(e) => setNewMapping(prev => ({...prev, surface: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                    placeholder="e.g., p"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Elementary Form</label>
                  <input
                    type="text"
                    value={newMapping.elementary}
                    onChange={(e) => setNewMapping(prev => ({...prev, elementary: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                    placeholder="e.g., wk"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <input
                    type="text"
                    value={newMapping.notes}
                    onChange={(e) => setNewMapping(prev => ({...prev, notes: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional description"
                  />
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t rounded-b-lg flex justify-end space-x-2">
                <button
                  onClick={() => setShowAddMapping(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={addMapping}
                  disabled={!newMapping.surface.trim() || !newMapping.elementary.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Mapping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Tab Components
  const OverviewTab = () => {
    const stats = getOverviewStats();
    
    return (
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8 rounded-xl border border-blue-100 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Statistics
          </h3>
          {/*
          <p className="text-gray-600 mb-6">
            Systematic decomposition and comparison of phonemic inventories across natural languages
          </p>
          */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={scrollToLanguageInventory}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-left group"
            >
              <div className="text-3xl font-bold text-blue-600 group-hover:text-blue-700">{languages.length}</div>
              <div className="text-sm text-gray-600 font-medium">Languages Analyzed</div>
            </button>
            <button 
              onClick={() => setSelectedOverview('surface')}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-left group"
            >
              <div className="text-3xl font-bold text-green-600 group-hover:text-green-700">{Object.keys(stats.surfacePhonemesCounts).length}</div>
              <div className="text-sm text-gray-600 font-medium">Unique Surface Phonemes</div>
            </button>
            <button 
              onClick={() => setSelectedOverview('elementary')}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-left group"
            >
              <div className="text-3xl font-bold text-purple-600 group-hover:text-purple-700">{Object.keys(stats.elementarySegmentsCounts).length}</div>
              <div className="text-sm text-gray-600 font-medium">Unique Elementary Segments</div>
            </button>
            <button 
              onClick={() => setSelectedOverview('suprasegmentals')}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-left group"
            >
              <div className="text-3xl font-bold text-orange-600 group-hover:text-orange-700">{stats.uniqueSuprasegmentals.length}</div>
              <div className="text-sm text-gray-600 font-medium">Unique Suprasegmentals</div>
            </button>
          </div>
        </div>

        {/* Language Inventory Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" data-inventory="true">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Language Inventory</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Family</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Surface</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Elementary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reduction</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {languages.map((lang) => {
                  const surfaceCount = lang.surfacePhonemes?.length || 0;
                  const elementaryCount = lang.elementarySegments?.length || 0;
                  const reduction = surfaceCount > 0 ? ((1 - elementaryCount / surfaceCount) * 100).toFixed(1) : 0;
                  return (
                    <tr key={lang.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{lang.name}</div>
                        <div className="text-sm text-gray-500">
                          {lang.family.split(' ')[0]}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{lang.family}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{surfaceCount}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{elementaryCount}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          -{reduction}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => setSelectedLanguage(lang)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium transition-colors"
                          >
                            Details
                          </button>
                          <button 
                            onClick={() => runValidation(lang.id)}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 font-medium transition-colors"
                          >
                            Validate
                          </button>
                          <button
                            onClick={() => deleteLanguage(lang.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 bg-blue-50 border-b border-gray-200 rounded-t-xl">
          <h3 className="text-lg font-semibold text-gray-900">Validation Results</h3>
          <p className="text-sm text-gray-600 mt-1">Test theoretical predictions of the elementary segment method</p>
        </div>
        <div className="p-6">
          {languages.map(lang => {
            const results = validationResults[lang.id];
            return (
              <div key={lang.id} className="mb-6 p-6 border border-gray-200 rounded-xl bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">{lang.name}</h4>
                  {!results && (
                    <button
                      onClick={() => runValidation(lang.id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 shadow-md transition-colors"
                    >
                      Run Validation
                    </button>
                  )}
                </div>
                
                {results && (
                  <div className="space-y-3">
                    {Object.entries(results).map(([rule, result]) => (
                      <div key={rule} className={`flex items-center space-x-3 p-3 rounded-lg ${
                        result.passed ? 'bg-green-50' : 'bg-red-50'
                      }`}>
                        {result.passed ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <span className="capitalize font-medium text-gray-900">{rule}:</span>
                        <span className="text-sm text-gray-700">{result.message}</span>
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
    const comparisons = languages.length >= 2 ? [
      ...languages.slice(0, -1).map((lang1, i) => 
        languages.slice(i + 1).map(lang2 => ({ lang1, lang2 }))
      ).flat()
    ] : [];

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200 rounded-t-xl">
            <h3 className="text-lg font-semibold text-gray-900">Cross-Linguistic Comparison</h3>
            <p className="text-sm text-gray-600 mt-1">Structural similarities in elementary segment systems</p>
          </div>
          <div className="p-6">
            {comparisons.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>Add at least 2 languages to see comparisons</p>
              </div>
            ) : (
              comparisons.map(({ lang1, lang2 }, idx) => {
                const similarity = calculateSimilarity(lang1, lang2);
                return (
                  <div key={idx} className="mb-8 p-6 border border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-white">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      {lang1.name} vs {lang2.name}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="text-2xl font-bold text-blue-600">{similarity.jaccard}%</div>
                        <div className="text-sm text-gray-600 font-medium">Segment Similarity</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <div className="text-2xl font-bold text-purple-600">{similarity.functionalJaccard}%</div>
                        <div className="text-sm text-gray-600 font-medium">Functional Similarity</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="text-2xl font-bold text-green-600">{similarity.shared.length}</div>
                        <div className="text-sm text-gray-600 font-medium">Shared Segments</div>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <div className="text-2xl font-bold text-red-600">
                          {Math.abs((lang1.elementarySegments?.length || 0) - (lang2.elementarySegments?.length || 0))}
                        </div>
                        <div className="text-sm text-gray-600 font-medium">Size Difference</div>
                      </div>
                    </div>
                    
                    <div className="text-sm space-y-2 bg-white p-4 rounded-lg border">
                      <div><strong>Shared segments:</strong> <span className="font-mono">{similarity.shared.join(', ') || 'None'}</span></div>
                      <div><strong>Only in {lang1.name}:</strong> <span className="font-mono">{similarity.unique1.join(', ') || 'None'}</span></div>
                      <div><strong>Only in {lang2.name}:</strong> <span className="font-mono">{similarity.unique2.join(', ') || 'None'}</span></div>
                    </div>
                    
                    {lang1.name === "Rotokas" && lang2.name === "Hawaiian" && (
                      <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <strong className="text-yellow-800">Structural Convergence:</strong> <span className="text-yellow-700">Despite genetic unrelatedness (North Bougainville vs Oceanic), 
                        these languages show remarkable structural similarity. Both reduce to small elementary segment systems (5-6) 
                        using similar organizational principles. With functional equivalence (k≈ʔ), Hawaiian essentially adds 
                        just /h/ to the Rotokas system.</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  };

  const ImportTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Import Analysis Data</h3>
        
        <div className="text-center">
          <div className="mx-auto h-24 w-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
            <Upload className="h-10 w-10 text-blue-500" />
          </div>
          <div className="mb-8">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="block text-lg font-medium text-gray-900 mb-2">
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
              <div className="mx-auto max-w-md">
                <div className="mt-2 flex justify-center px-6 pt-8 pb-8 border-2 border-gray-300 border-dashed rounded-xl hover:border-gray-400 transition-colors bg-gray-50 hover:bg-gray-100">
                  <div className="text-center">
                    <FileText className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                    <div className="text-sm text-gray-600">
                      <span className="font-medium text-blue-600 hover:text-blue-500">
                        Click to upload
                      </span> or drag and drop
                    </div>
                    <p className="text-xs text-gray-500 mt-1">CSV files only</p>
                  </div>
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Download className="w-5 h-5 mr-2 text-blue-600" />
            Need a template?
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            Download a CSV template with the three example languages as a starting point for your own analysis
          </p>
          <button
            onClick={exportTemplate}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </button>
        </div>
      </div>
    </div>
  );

  // Overview Detail Modal
  const OverviewDetailModal = ({ type, onClose }) => {
    const stats = getOverviewStats();
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    
    const vowels = ['a', 'e', 'i', 'o', 'u', 'æ', 'ɑ', 'ɛ', 'ɪ', 'ɒ', 'ɔ', 'ʊ', 'ʌ', 'ə', 'ɜ'];
    
    const isVowel = (phoneme) => {
      const clean = phoneme.replace(/[ːˑ̥̃̊]/g, '').toLowerCase();
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

      if (type === 'surface' && filterType !== 'all') {
        items = items.filter(([phoneme]) => {
          if (filterType === 'vowels') return isVowel(phoneme);
          if (filterType === 'consonants') return !isVowel(phoneme);
          return true;
        });
      }

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
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[75vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-xl flex items-center justify-between flex-shrink-0">
            <h3 className="text-xl font-semibold">{content.title}</h3>
            <button
              onClick={onClose}
              className="text-blue-100 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="px-6 py-4 border-b bg-gray-50 flex-shrink-0">
            <p className="text-gray-600 mb-3">{content.totalCount} total {type} across all languages</p>
            
            <input
              type="text"
              placeholder="Search segments..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="p-6 overflow-y-auto flex-1">
            {filterType === 'all' || type !== 'surface' ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {content.items.map(([item, count]) => (
                  <div key={item} className="bg-gradient-to-br from-gray-50 to-gray-100 px-3 py-2 rounded-lg text-center border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="font-mono font-semibold text-gray-900">/{item}/</div>
                    <div className="text-xs text-gray-500 mt-1">
                      ({count} {count === 1 ? 'lang' : 'langs'})
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 mt-8">
                <Eye className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>Click "All" to view segments, or use the filter buttons above</p>
              </div>
            )}
            
            {content.items.length === 0 && localSearchTerm && (
              <div className="text-center text-gray-500 mt-8">
                <p>No segments found matching "{localSearchTerm}"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Global Linguistic Analaysis Project
          </h1>
          <p className="text-gray-600 text-lg">
            Practical Applications of Impractical Phonemic Analyses
          </p>
        </div>

        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: Database },
              { id: 'validation', name: 'Validation', icon: CheckCircle },
              { id: 'comparison', name: 'Comparison', icon: BarChart3 },
            ].map(({ id, name, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
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

        {/* Modals */}
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

        {showAddLanguage && <AddLanguageModal />}
    </div>
  );
};

export default ComprehensivePhonemicSystem;