/* ============================================================
   CIVIL ENGINEERING CODE BOOK — script.js
   ============================================================
   PDF system: all PDFs load from local pdfs/ folder.
   No Google links. No internet. Fully offline.
   "PDF Not Available" shown when file is missing.
   ============================================================ */

'use strict';

/* ── Generate local PDF path from code number ───────────────── */
function localPdfPath(number) {
  /* "IS 456"          -> pdfs/IS456.pdf
     "IS 875 Part 1"   -> pdfs/IS875-Part-1.pdf
     "IRC 37"          -> pdfs/IRC37.pdf
     "ACI 318"         -> pdfs/ACI318.pdf
     "EN 1992-1-1"     -> pdfs/EN1992-1-1.pdf    */
  const parts = (number || '').trim().split(/\s+/);
  if (parts.length < 2) return `pdfs/${parts[0] || 'unknown'}.pdf`;
  const base = parts[0] + parts[1];
  const rest = parts.slice(2);
  return rest.length ? `pdfs/${base}-${rest.join('-')}.pdf` : `pdfs/${base}.pdf`;
}

/* Return the local pdf path — always a pdfs/ relative path, never http */
function getPdfPath(code) {
  const stored = code.pdf || '';
  /* If stored path is already a clean local path, use it */
  if (stored && !stored.startsWith('http')) return stored;
  /* Otherwise compute from code number */
  return localPdfPath(code.number);
}

/* ── Embedded fallback data (used when fetch fails on file://) ── */
const CODES_FALLBACK = [
  { id:'is-456', number:'IS 456', title:'Plain and Reinforced Concrete – Code of Practice', category:'Concrete', description:'Specifies requirements for design and construction of plain and reinforced concrete structures.', keywords:['concrete','rcc','reinforced','beam','column','slab','footing','design'], revision:2000, department:'BIS', applications:['Buildings','Bridges','Retaining Walls','Foundations','Water Tanks'], relatedCodes:['IS 10262','IS 383','IS 1786','IS 516','SP 16'], notes:'Most widely used concrete design code in India. Follows limit state design method.', pdf:'https://www.google.com/search?q=IS+456+2000+PDF+BIS+free+download' },
  { id:'is-875-1', number:'IS 875 Part 1', title:'Code of Practice for Design Loads – Dead Loads', category:'Structural Engineering', description:'Specifies unit weights of building materials for computing dead loads.', keywords:['dead load','unit weight','load','structural','design loads'], revision:1987, department:'BIS', applications:['Buildings','Industrial Structures'], relatedCodes:['IS 875 Part 2','IS 875 Part 3','IS 1893'], notes:'Part of IS 875 series covering all design load types.', pdf:'https://www.google.com/search?q=IS+875+Part+1+1987+PDF+BIS+free+download' },
  { id:'is-875-2', number:'IS 875 Part 2', title:'Code of Practice for Design Loads – Imposed Loads', category:'Structural Engineering', description:'Specifies imposed (live) loads for floors, roofs and other surfaces of buildings.', keywords:['live load','imposed load','floor load','roof load','structural'], revision:1987, department:'BIS', applications:['Residential Buildings','Commercial Buildings'], relatedCodes:['IS 875 Part 1','IS 875 Part 3','IS 456'], notes:'Tabulates imposed loads for various occupancy types.', pdf:'https://www.google.com/search?q=IS+875+Part+2+1987+PDF+free+download' },
  { id:'is-875-3', number:'IS 875 Part 3', title:'Code of Practice for Design Loads – Wind Loads', category:'Wind', description:'Gives wind speed data and methods to calculate wind pressure on buildings and structures.', keywords:['wind load','wind pressure','wind speed','gust','terrain'], revision:2015, department:'BIS', applications:['Tall Buildings','Towers','Chimneys'], relatedCodes:['IS 875 Part 1','IS 875 Part 5','IS 1893'], notes:'Revised 2015 with updated wind speed maps of India.', pdf:'https://www.google.com/search?q=IS+875+Part+3+2015+wind+loads+PDF' },
  { id:'is-875-4', number:'IS 875 Part 4', title:'Code of Practice for Design Loads – Snow Loads', category:'Structural Engineering', description:'Covers snow load considerations for roofs in snowfall regions.', keywords:['snow load','roof load','design loads','himalayan'], revision:1987, department:'BIS', applications:['Hilly Terrain Buildings'], relatedCodes:['IS 875 Part 1','IS 875 Part 2'], notes:'Applicable to buildings in northern hilly regions.', pdf:'https://www.google.com/search?q=IS+875+Part+4+snow+loads+PDF' },
  { id:'is-875-5', number:'IS 875 Part 5', title:'Code of Practice for Design Loads – Special Loads and Combinations', category:'Structural Engineering', description:'Covers thermal, fatigue, erection loads and load combinations.', keywords:['special loads','load combination','thermal load','erection load'], revision:1987, department:'BIS', applications:['Industrial Structures'], relatedCodes:['IS 875 Part 1','IS 875 Part 2','IS 1893'], notes:'Used alongside other IS 875 parts for comprehensive load analysis.', pdf:'https://www.google.com/search?q=IS+875+Part+5+special+loads+PDF' },
  { id:'is-10262', number:'IS 10262', title:'Concrete Mix Proportioning – Guidelines', category:'Concrete', description:'Provides guidelines for proportioning concrete mixes for desired workability, strength and durability.', keywords:['mix design','concrete mix','water cement ratio','workability','strength'], revision:2019, department:'BIS', applications:['All Concrete Works','RCC Structures'], relatedCodes:['IS 456','IS 383','IS 1786'], notes:'Revised 2019 to include performance-based design approach.', pdf:'https://www.google.com/search?q=IS+10262+2019+concrete+mix+design+PDF' },
  { id:'is-383', number:'IS 383', title:'Coarse and Fine Aggregate for Concrete – Specification', category:'Construction Materials', description:'Specifies requirements for natural and crushed aggregates used in concrete.', keywords:['aggregate','sand','gravel','coarse aggregate','fine aggregate','concrete material','m-sand'], revision:2016, department:'BIS', applications:['Concrete Production','Mortar','Plaster'], relatedCodes:['IS 456','IS 10262','IS 2386'], notes:'Revised 2016 to include manufactured sand (M-Sand) specifications.', pdf:'https://www.google.com/search?q=IS+383+2016+aggregate+concrete+PDF' },
  { id:'is-1786', number:'IS 1786', title:'High Strength Deformed Steel Bars and Wires for Concrete Reinforcement', category:'Steel', description:'Specifies requirements for TMT bars Fe415, Fe500, Fe550, Fe600 for reinforcing concrete.', keywords:['rebar','reinforcement','steel bar','deformed bar','fe415','fe500','tmt','tor steel'], revision:2008, department:'BIS', applications:['RCC Structures','Foundations','Beams','Columns','Slabs'], relatedCodes:['IS 456','IS 432','IS 2062'], notes:'Fe500D and Fe550D include enhanced ductility for seismic zones.', pdf:'https://www.google.com/search?q=IS+1786+2008+TMT+bars+reinforcement+PDF' },
  { id:'is-432', number:'IS 432', title:'Mild Steel and Medium Tensile Steel Bars for Concrete Reinforcement', category:'Steel', description:'Specifies requirements for mild steel bars used in concrete reinforcement.', keywords:['mild steel','steel bar','reinforcement','round bar','fe250'], revision:1982, department:'BIS', applications:['Plain Cement Concrete','Light Reinforcement'], relatedCodes:['IS 1786','IS 456'], notes:'Covers Fe250 grade plain round bars.', pdf:'https://www.google.com/search?q=IS+432+mild+steel+bars+reinforcement+PDF' },
  { id:'is-800', number:'IS 800', title:'General Construction in Steel – Code of Practice', category:'Steel', description:'Comprehensive code for design, fabrication and erection of steel structures using limit state method.', keywords:['steel structure','structural steel','limit state','beam','column','connection','weld','bolt'], revision:2007, department:'BIS', applications:['Industrial Buildings','Steel Bridges','Towers','Trusses'], relatedCodes:['IS 2062','IS 816','IS 875'], notes:'Revised 2007 from working stress to limit state design.', pdf:'https://www.google.com/search?q=IS+800+2007+steel+structures+PDF+free' },
  { id:'is-2062', number:'IS 2062', title:'Hot Rolled Medium and High Tensile Structural Steel – Specification', category:'Steel', description:'Specifies requirements for hot rolled steel plates, strips, shapes and sections.', keywords:['structural steel','hot rolled','steel section','angle','channel','i-section','steel plate'], revision:2011, department:'BIS', applications:['Steel Structures','Bridges','Industrial Buildings'], relatedCodes:['IS 800','IS 808'], notes:'Covers grades E250, E300, E350, E410, E450, E550.', pdf:'https://www.google.com/search?q=IS+2062+2011+structural+steel+PDF' },
  { id:'is-1343', number:'IS 1343', title:'Prestressed Concrete – Code of Practice', category:'Prestressed Concrete', description:'Covers design and construction of prestressed concrete structures including pre and post-tensioning.', keywords:['prestressed concrete','psc','pre-tensioning','post-tensioning','tendon','anchorage'], revision:2012, department:'BIS', applications:['Long Span Bridges','Girders','Roof Members','Railway Sleepers'], relatedCodes:['IS 456','IS 6006','IRC 18'], notes:'Revised 2012 with updated limit state design approach.', pdf:'https://www.google.com/search?q=IS+1343+2012+prestressed+concrete+PDF' },
  { id:'is-3370-1', number:'IS 3370 Part 1', title:'Concrete Structures for Storage of Liquids – General', category:'Concrete', description:'Provides guidance for design of concrete structures for storage of water and liquids.', keywords:['water tank','liquid storage','reservoir','concrete tank','crack width','watertight'], revision:2009, department:'BIS', applications:['Water Storage Tanks','Sewage Tanks','Underground Reservoirs'], relatedCodes:['IS 456','IS 3370 Part 2'], notes:'Revised 2009 to align with limit state design.', pdf:'https://www.google.com/search?q=IS+3370+liquid+retaining+structures+PDF' },
  { id:'is-1893-1', number:'IS 1893 Part 1', title:'Criteria for Earthquake Resistant Design – General Provisions and Buildings', category:'Earthquake', description:'Provides seismic zoning map and criteria for earthquake resistant design of buildings.', keywords:['earthquake','seismic','zone','response spectrum','base shear','ductility','lateral load'], revision:2016, department:'BIS', applications:['All Buildings in Seismic Zones','Industrial Structures','Chimneys'], relatedCodes:['IS 13920','IS 4326','IS 456'], notes:'Revised 2016. India divided into four seismic zones (II to V).', pdf:'https://www.google.com/search?q=IS+1893+2016+earthquake+resistant+design+PDF' },
  { id:'is-13920', number:'IS 13920', title:'Ductile Design and Detailing of Reinforced Concrete Structures Subject to Seismic Forces', category:'Earthquake', description:'Specifies ductile detailing for RC members to ensure adequate seismic performance.', keywords:['ductile detailing','seismic','earthquake','confinement','stirrup','reinforcement detail'], revision:2016, department:'BIS', applications:['RCC Buildings in Seismic Zones III IV V'], relatedCodes:['IS 1893 Part 1','IS 456'], notes:'Mandatory for buildings in seismic zones III and above.', pdf:'https://www.google.com/search?q=IS+13920+2016+ductile+detailing+PDF' },
  { id:'is-4326', number:'IS 4326', title:'Earthquake Resistant Design and Construction of Buildings', category:'Earthquake', description:'Covers earthquake resistant construction features for masonry, timber and RCC buildings.', keywords:['earthquake','seismic','masonry building','construction','band','lintel band'], revision:2013, department:'BIS', applications:['Masonry Buildings','Low Rise Buildings'], relatedCodes:['IS 1893','IS 13920','IS 13828'], notes:'Prescribes seismic bands for masonry.', pdf:'https://www.google.com/search?q=IS+4326+earthquake+resistant+buildings+PDF' },
  { id:'is-13828', number:'IS 13828', title:'Improving Earthquake Resistance of Low Strength Masonry Buildings', category:'Earthquake', description:'Guidelines for improving seismic resistance of existing low strength masonry buildings.', keywords:['masonry','earthquake retrofit','seismic','low strength','existing building'], revision:1993, department:'BIS', applications:['Rural Buildings','Old Masonry Structures'], relatedCodes:['IS 4326','IS 1893'], notes:'Especially useful for rural construction.', pdf:'https://www.google.com/search?q=IS+13828+masonry+earthquake+PDF' },
  { id:'is-2911-1-1', number:'IS 2911 Part 1 Sec 1', title:'Design and Construction of Pile Foundations – Driven Cast In-situ Concrete Piles', category:'Foundation & Geotechnical', description:'Covers design and construction of driven cast-in-situ concrete pile foundations.', keywords:['pile','pile foundation','driven pile','cast in situ','deep foundation'], revision:2010, department:'BIS', applications:['High Rise Buildings','Bridges','Marine Structures'], relatedCodes:['IS 6403','IS 1904'], notes:'Part of IS 2911 series covering all pile types.', pdf:'https://www.google.com/search?q=IS+2911+pile+foundation+PDF+free+download' },
  { id:'is-2911-1-2', number:'IS 2911 Part 1 Sec 2', title:'Design and Construction of Pile Foundations – Bored Cast In-situ Piles', category:'Foundation & Geotechnical', description:'Covers design and construction of bored cast-in-situ concrete pile foundations.', keywords:['bored pile','pile foundation','cast in situ','deep foundation','rcc pile'], revision:2010, department:'BIS', applications:['Urban Construction','Bridge Foundations'], relatedCodes:['IS 2911 Part 1 Sec 1','IS 6403'], notes:'Most commonly used pile type in Indian urban construction.', pdf:'https://www.google.com/search?q=IS+2911+bored+pile+foundation+PDF' },
  { id:'is-6403', number:'IS 6403', title:'Determination of Breaking Capacity of Shallow Foundations', category:'Foundation & Geotechnical', description:'Provides methods to determine the ultimate bearing capacity of shallow foundations.', keywords:['bearing capacity','shallow foundation','footing','soil','safe bearing capacity'], revision:1981, department:'BIS', applications:['Spread Footings','Raft Foundations'], relatedCodes:['IS 1904','IS 2720','IS 1888'], notes:'Based on Terzaghi and Meyerhof bearing capacity theories.', pdf:'https://www.google.com/search?q=IS+6403+bearing+capacity+shallow+foundation+PDF' },
  { id:'is-1904', number:'IS 1904', title:'Design and Construction of Foundations in Soils – General Requirements', category:'Foundation & Geotechnical', description:'Provides general requirements for design and construction of foundations in soils.', keywords:['foundation','soil','settlement','bearing capacity','shallow foundation','design'], revision:1986, department:'BIS', applications:['All Types of Foundations','Site Investigation'], relatedCodes:['IS 6403','IS 2911','IS 1888'], notes:'General umbrella code for all foundation design in India.', pdf:'https://www.google.com/search?q=IS+1904+foundation+design+soils+PDF' },
  { id:'is-1888', number:'IS 1888', title:'Method of Load Test on Soils', category:'Foundation & Geotechnical', description:'Describes procedure for plate load test on soils to determine bearing capacity.', keywords:['plate load test','soil test','bearing capacity','settlement','PLT','field test'], revision:1982, department:'BIS', applications:['Site Investigation','Foundation Design'], relatedCodes:['IS 6403','IS 1904'], notes:'Direct field method to determine allowable bearing pressure.', pdf:'https://www.google.com/search?q=IS+1888+plate+load+test+soils+PDF' },
  { id:'is-2720-1', number:'IS 2720 Part 1', title:'Methods of Test for Soils – Preparation of Dry Soil Samples', category:'Foundation & Geotechnical', description:'Specifies method for preparation of dry soil samples for testing.', keywords:['soil test','soil sample','geotechnical','laboratory test','soil investigation'], revision:1983, department:'BIS', applications:['Geotechnical Investigation','Foundation Design'], relatedCodes:['IS 2720 Part 2','IS 2720 Part 3'], notes:'Part of extensive IS 2720 series with 40+ parts.', pdf:'https://www.google.com/search?q=IS+2720+soil+testing+PDF+free' },
  { id:'is-2720-5', number:'IS 2720 Part 5', title:'Methods of Test for Soils – Atterberg Limits', category:'Foundation & Geotechnical', description:'Specifies methods for liquid limit, plastic limit and shrinkage limit of soils.', keywords:['atterberg limits','liquid limit','plastic limit','plasticity index','consistency','clay'], revision:1985, department:'BIS', applications:['Soil Classification','Subgrade Evaluation'], relatedCodes:['IS 2720 Part 4','IS 1498'], notes:'Casagrande apparatus used for liquid limit.', pdf:'https://www.google.com/search?q=IS+2720+Part+5+Atterberg+limits+PDF' },
  { id:'is-2720-7', number:'IS 2720 Part 7', title:'Methods of Test for Soils – Light Compaction (Proctor)', category:'Foundation & Geotechnical', description:'Standard Proctor compaction test to determine optimum moisture content and maximum dry density.', keywords:['proctor test','compaction','OMC','MDD','optimum moisture','dry density','earthwork'], revision:1980, department:'BIS', applications:['Embankment Design','Road Subgrade','Earth Dam'], relatedCodes:['IS 2720 Part 8','IS 2720 Part 5'], notes:'Heavy compaction covered in IS 2720 Part 8.', pdf:'https://www.google.com/search?q=IS+2720+Part+7+proctor+compaction+PDF' },
  { id:'is-1498', number:'IS 1498', title:'Classification and Identification of Soils for General Engineering Purposes', category:'Foundation & Geotechnical', description:'Provides Indian Standard classification system for soils based on plasticity and grain size.', keywords:['soil classification','IS classification','clay','silt','gravel','sand','plasticity chart'], revision:1970, department:'BIS', applications:['Site Investigation','Foundation Design'], relatedCodes:['IS 2720 Part 4','IS 2720 Part 5'], notes:'Based on Unified Soil Classification System (USCS).', pdf:'https://www.google.com/search?q=IS+1498+soil+classification+PDF' },
  { id:'is-516', number:'IS 516', title:'Methods of Tests for Strength of Concrete', category:'Concrete', description:'Specifies methods for making, curing and testing concrete specimens for strength.', keywords:['concrete test','compressive strength','cube test','flexural strength','curing','concrete cube'], revision:1959, department:'BIS', applications:['Concrete Quality Control','Structural Testing'], relatedCodes:['IS 456','IS 10262','IS 1199'], notes:'150mm cube specimens used in India.', pdf:'https://www.google.com/search?q=IS+516+concrete+strength+test+PDF' },
  { id:'is-1199', number:'IS 1199', title:'Methods of Sampling and Analysis of Concrete', category:'Concrete', description:'Specifies methods for testing workability using slump, compaction factor and Vee-Bee tests.', keywords:['workability','slump test','compaction factor','vee-bee','fresh concrete','sampling'], revision:1959, department:'BIS', applications:['Concrete Quality Control','Site Testing'], relatedCodes:['IS 456','IS 516','IS 10262'], notes:'Slump test most commonly used workability test in India.', pdf:'https://www.google.com/search?q=IS+1199+concrete+workability+slump+PDF' },
  { id:'is-2386', number:'IS 2386', title:'Methods of Test for Aggregates for Concrete', category:'Construction Materials', description:'Specifies tests for physical and mechanical properties of aggregates.', keywords:['aggregate test','impact value','crushing value','abrasion','flakiness','elongation'], revision:1963, department:'BIS', applications:['Aggregate Quality Control','Mix Design'], relatedCodes:['IS 383','IS 456','IS 10262'], notes:'Multi-part standard covering all aggregate tests.', pdf:'https://www.google.com/search?q=IS+2386+aggregate+test+concrete+PDF' },
  { id:'is-269', number:'IS 269', title:'Ordinary Portland Cement – Specification (33 Grade)', category:'Construction Materials', description:'Specifies requirements for Ordinary Portland Cement 33 grade.', keywords:['cement','OPC','portland cement','ordinary cement','33 grade'], revision:2015, department:'BIS', applications:['General Construction','Concrete','Mortar'], relatedCodes:['IS 8112','IS 12269','IS 1489'], notes:'33 grade OPC. Higher grades in IS 8112 and IS 12269.', pdf:'https://www.google.com/search?q=IS+269+OPC+33+grade+cement+PDF' },
  { id:'is-8112', number:'IS 8112', title:'Ordinary Portland Cement 43 Grade – Specification', category:'Construction Materials', description:'Specifies requirements for Ordinary Portland Cement of 43 grade.', keywords:['cement','OPC','43 grade','portland cement'], revision:2013, department:'BIS', applications:['General RCC Works','Concrete Structures'], relatedCodes:['IS 269','IS 12269','IS 456'], notes:'Most commonly used cement grade in Indian construction.', pdf:'https://www.google.com/search?q=IS+8112+OPC+43+grade+cement+PDF' },
  { id:'is-12269', number:'IS 12269', title:'Ordinary Portland Cement 53 Grade – Specification', category:'Construction Materials', description:'Specifies requirements for OPC 53 grade with higher early and ultimate strength.', keywords:['cement','OPC','53 grade','high strength cement','portland cement'], revision:2013, department:'BIS', applications:['High Strength Concrete','Precast','Fast Track Projects'], relatedCodes:['IS 269','IS 8112','IS 456'], notes:'Highest strength OPC grade.', pdf:'https://www.google.com/search?q=IS+12269+OPC+53+grade+cement+PDF' },
  { id:'is-1489-1', number:'IS 1489 Part 1', title:'Portland Pozzolana Cement (Fly Ash Based) – Specification', category:'Construction Materials', description:'Specifies requirements for Portland Pozzolana Cement made with fly ash.', keywords:['PPC','pozzolana cement','fly ash','blended cement'], revision:1991, department:'BIS', applications:['Mass Concrete','Marine Structures','General Construction'], relatedCodes:['IS 269','IS 8112','IS 456'], notes:'Preferred for marine and sulfate-resistant applications.', pdf:'https://www.google.com/search?q=IS+1489+portland+pozzolana+cement+PDF' },
  { id:'is-455', number:'IS 455', title:'Portland Slag Cement – Specification', category:'Construction Materials', description:'Specifies requirements for Portland Slag Cement made with GGBS.', keywords:['PSC','slag cement','GGBS','blended cement','portland slag'], revision:1989, department:'BIS', applications:['Sulfate Resistant Construction','Marine Structures'], relatedCodes:['IS 269','IS 1489','IS 456'], notes:'Good sulfate resistance. Lower heat of hydration than OPC.', pdf:'https://www.google.com/search?q=IS+455+portland+slag+cement+PDF' },
  { id:'is-9103', number:'IS 9103', title:'Concrete Admixtures – Specification', category:'Concrete', description:'Specifies requirements for chemical admixtures including plasticizers, retarders and accelerators.', keywords:['admixture','plasticizer','superplasticizer','retarder','accelerator','concrete additive'], revision:1999, department:'BIS', applications:['Ready Mix Concrete','High Performance Concrete'], relatedCodes:['IS 456','IS 10262'], notes:'Chemical admixtures improve workability and reduce w/c ratio.', pdf:'https://www.google.com/search?q=IS+9103+concrete+admixtures+PDF' },
  { id:'is-1077', number:'IS 1077', title:'Common Burnt Clay Building Bricks – Specification', category:'Masonry', description:'Specifies requirements for common burnt clay bricks used in masonry construction.', keywords:['brick','clay brick','burnt brick','masonry','brick strength','water absorption'], revision:1992, department:'BIS', applications:['Wall Construction','Masonry Structures'], relatedCodes:['IS 3495','IS 1905','IS 2250'], notes:'Classifies bricks into grades by compressive strength.', pdf:'https://www.google.com/search?q=IS+1077+burnt+clay+bricks+PDF' },
  { id:'is-3495', number:'IS 3495', title:'Methods of Tests of Burnt Clay Building Bricks', category:'Masonry', description:'Specifies methods of tests for burnt clay bricks.', keywords:['brick test','compressive strength','water absorption','efflorescence'], revision:1992, department:'BIS', applications:['Brick Quality Control','Material Testing'], relatedCodes:['IS 1077','IS 1905'], notes:'Standard test methods for brick quality.', pdf:'https://www.google.com/search?q=IS+3495+brick+test+methods+PDF' },
  { id:'is-1905', number:'IS 1905', title:'Structural Use of Unreinforced Masonry – Code of Practice', category:'Masonry', description:'Code for structural design of unreinforced load bearing masonry walls, columns and piers.', keywords:['masonry design','load bearing','brick wall','masonry wall','slenderness ratio'], revision:1987, department:'BIS', applications:['Load Bearing Masonry Buildings','Compound Walls'], relatedCodes:['IS 1077','IS 2250','IS 4326'], notes:'Covers unreinforced masonry using working stress method.', pdf:'https://www.google.com/search?q=IS+1905+unreinforced+masonry+structural+PDF' },
  { id:'is-2250', number:'IS 2250', title:'Preparation and Use of Masonry Mortars – Code of Practice', category:'Masonry', description:'Provides guidelines for preparation of mortar used in brick and stone masonry.', keywords:['mortar','masonry mortar','cement mortar','lime mortar','brick mortar'], revision:1981, department:'BIS', applications:['Brick Masonry','Stone Masonry','Plaster Work'], relatedCodes:['IS 1077','IS 1905'], notes:'Specifies mix proportions for different mortar grades.', pdf:'https://www.google.com/search?q=IS+2250+masonry+mortar+PDF' },
  { id:'is-10500', number:'IS 10500', title:'Drinking Water – Specification', category:'Water Supply', description:'Specifies quality standards for drinking water including physical, chemical and bacteriological requirements.', keywords:['drinking water','water quality','potable water','water standard','pH','turbidity','coliform'], revision:2012, department:'BIS', applications:['Water Treatment Plants','Public Water Supply'], relatedCodes:['IS 1172','IS 2470'], notes:'Aligned with WHO guidelines for drinking water quality.', pdf:'https://www.google.com/search?q=IS+10500+drinking+water+specification+PDF' },
  { id:'is-1172', number:'IS 1172', title:'Code of Basic Requirements for Water Supply, Drainage and Sanitation', category:'Water Supply', description:'Provides basic requirements for water supply and sanitation systems for buildings.', keywords:['water supply','drainage','sanitation','per capita','plumbing','building services'], revision:1993, department:'BIS', applications:['Residential Buildings','Urban Planning'], relatedCodes:['IS 10500','IS 1742','IS 2470'], notes:'Specifies per capita water demand for different uses.', pdf:'https://www.google.com/search?q=IS+1172+water+supply+drainage+sanitation+PDF' },
  { id:'is-1742', number:'IS 1742', title:'Code of Practice for Building Drainage', category:'Water Supply', description:'Covers design and installation of drainage systems within and around buildings.', keywords:['drainage','building drainage','sewer','sanitary','trap','manhole','plumbing'], revision:1983, department:'BIS', applications:['Building Drainage Systems','Sanitary Systems'], relatedCodes:['IS 1172','IS 2470'], notes:'Covers gravity drainage and ventilation.', pdf:'https://www.google.com/search?q=IS+1742+building+drainage+PDF' },
  { id:'is-2470-1', number:'IS 2470 Part 1', title:'Installation of Septic Tanks – Code of Practice (Design)', category:'Wastewater', description:'Provides design guidelines for septic tanks for treatment of domestic sewage.', keywords:['septic tank','wastewater','sewage treatment','onsite sanitation','effluent'], revision:1985, department:'BIS', applications:['Rural Sanitation','Individual Household Systems'], relatedCodes:['IS 1172','IS 1742'], notes:'Used where no public sewer system exists.', pdf:'https://www.google.com/search?q=IS+2470+septic+tank+design+PDF' },
  { id:'is-4111-1', number:'IS 4111 Part 1', title:'Code of Practice for Ancillary Structures in Sewerage System – Manholes', category:'Wastewater', description:'Specifies design and construction requirements for manholes in sewerage systems.', keywords:['manhole','sewer','sewerage','inspection chamber','underground drainage'], revision:1986, department:'BIS', applications:['Sewer Networks','Municipal Infrastructure'], relatedCodes:['IS 1742','IS 2470'], notes:'Covers brick, stone and RCC manhole construction.', pdf:'https://www.google.com/search?q=IS+4111+manhole+sewerage+PDF' },
  { id:'is-883', number:'IS 883', title:'Design of Structural Timber in Building – Code of Practice', category:'Timber', description:'Provides design guidelines for structural timber members using working stress method.', keywords:['timber','wood','structural timber','beam','truss','timber design','lumber'], revision:1994, department:'BIS', applications:['Timber Roofs','Wooden Floors','Timber Trusses'], relatedCodes:['IS 287','IS 1141'], notes:'Covers design of beams, columns, connections in timber.', pdf:'https://www.google.com/search?q=IS+883+structural+timber+design+PDF' },
  { id:'is-287', number:'IS 287', title:'Recommendations for Maximum Permissible Moisture Content of Timber', category:'Timber', description:'Specifies maximum permissible moisture content of timber for various applications.', keywords:['timber','moisture content','wood','seasoning','drying'], revision:1993, department:'BIS', applications:['Timber for Construction','Furniture Making'], relatedCodes:['IS 883','IS 1141'], notes:'Controls moisture to prevent decay and warping.', pdf:'https://www.google.com/search?q=IS+287+timber+moisture+content+PDF' },
  { id:'is-962', number:'IS 962', title:'Code of Practice for Architectural and Building Drawings', category:'Building Planning', description:'Specifies conventions, symbols and methods for preparation of architectural drawings.', keywords:['drawing','architectural drawing','building plan','symbols','conventions','drafting'], revision:1989, department:'BIS', applications:['Architectural Design','Building Permit Drawings'], relatedCodes:['SP 7','NBC 2016'], notes:'Standard reference for drawing conventions in India.', pdf:'https://www.google.com/search?q=IS+962+architectural+building+drawings+PDF' },
  { id:'is-1641', number:'IS 1641', title:'Code of Practice for Fire Safety of Buildings – General Principles', category:'Fire Safety', description:'Provides general principles for fire grading and classification of buildings.', keywords:['fire safety','fire rating','fire grading','building fire','fire protection'], revision:1988, department:'BIS', applications:['All Buildings','Fire Safety Planning'], relatedCodes:['IS 1642','NBC 2016'], notes:'First in a series of fire safety codes for buildings.', pdf:'https://www.google.com/search?q=IS+1641+fire+safety+buildings+PDF' },
  { id:'is-3696-1', number:'IS 3696 Part 1', title:'Safety Code for Scaffolds and Ladders – Scaffolds', category:'Construction Management', description:'Provides safety requirements for design and erection of scaffolding.', keywords:['scaffold','scaffolding','construction safety','formwork','working platform'], revision:1987, department:'BIS', applications:['Building Construction','Bridge Construction'], relatedCodes:['IS 3696 Part 2','IS 4082'], notes:'Essential for safe working at height.', pdf:'https://www.google.com/search?q=IS+3696+scaffolding+safety+PDF' },
  { id:'is-4082', number:'IS 4082', title:'Recommendations on Stacking and Storage of Construction Materials at Site', category:'Construction Management', description:'Provides guidelines for proper stacking, storage and handling of construction materials.', keywords:['storage','stacking','material handling','site management','construction materials'], revision:1996, department:'BIS', applications:['Construction Site Management'], relatedCodes:['IS 3696','IS 4926'], notes:'Helps prevent material deterioration and site accidents.', pdf:'https://www.google.com/search?q=IS+4082+construction+materials+storage+PDF' },
  { id:'is-4926', number:'IS 4926', title:'Ready Mixed Concrete – Code of Practice', category:'Concrete', description:'Covers requirements for production, delivery and testing of ready mixed concrete (RMC).', keywords:['ready mix concrete','RMC','transit mixer','batching plant','concrete delivery'], revision:2003, department:'BIS', applications:['Urban Construction','Large Projects'], relatedCodes:['IS 456','IS 10262'], notes:'RMC ensures consistent quality and faster construction.', pdf:'https://www.google.com/search?q=IS+4926+ready+mixed+concrete+PDF' },
  { id:'is-816', number:'IS 816', title:'Code of Practice for Use of Metal Arc Welding for General Construction in Mild Steel', category:'Steel', description:'Covers requirements for metal arc welding of mild steel for general construction.', keywords:['welding','arc welding','mild steel','weld','electrode','fillet weld','butt weld'], revision:1969, department:'BIS', applications:['Steel Structure Fabrication','Bridge Construction'], relatedCodes:['IS 800','IS 2062','IS 1024'], notes:'Covers qualification, procedure and inspection of welds.', pdf:'https://www.google.com/search?q=IS+816+arc+welding+mild+steel+PDF' },
  { id:'irc-6', number:'IRC 6', title:'Standard Specifications and Code of Practice for Road Bridges – Loads and Load Combinations', category:'Bridge', description:'Specifies standard vehicle loadings (IRC Class AA, A, B) and load combinations for road bridges.', keywords:['bridge load','vehicle load','IRC class','road bridge','truck load','bridge design'], revision:2017, department:'IRC', applications:['Highway Bridges','Flyovers','Grade Separators','Culverts'], relatedCodes:['IRC 21','IRC 78','IRC 112'], notes:'IRC Class AA tracked and wheeled vehicles are standard design vehicles.', pdf:'https://www.google.com/search?q=IRC+6+road+bridge+loads+PDF+free+download' },
  { id:'irc-21', number:'IRC 21', title:'Standard Specifications for Road Bridges – Cement Concrete Bridges', category:'Bridge', description:'Covers design requirements for plain and reinforced concrete road bridges.', keywords:['concrete bridge','RCC bridge','road bridge','bridge design','span','girder'], revision:2000, department:'IRC', applications:['RCC Road Bridges','Culverts'], relatedCodes:['IRC 6','IRC 78','IS 456'], notes:'Now largely superseded by IRC 112 for new bridges.', pdf:'https://www.google.com/search?q=IRC+21+concrete+road+bridges+PDF' },
  { id:'irc-37', number:'IRC 37', title:'Guidelines for Design of Flexible Pavements', category:'Transportation & Highway', description:'Provides design procedures for flexible (bituminous) pavements based on traffic and subgrade strength.', keywords:['flexible pavement','bituminous pavement','road design','CBR','traffic','pavement thickness','highway'], revision:2018, department:'IRC', applications:['National Highways','State Highways','Urban Roads','Rural Roads'], relatedCodes:['IRC 58','IRC 73','IRC 15'], notes:'Revised 2018 with mechanistic-empirical design approach.', pdf:'https://www.google.com/search?q=IRC+37+2018+flexible+pavement+design+PDF' },
  { id:'irc-58', number:'IRC 58', title:'Guidelines for Design of Plain Jointed Rigid Pavements for Highways', category:'Transportation & Highway', description:'Provides design procedures for plain cement concrete (rigid) pavements for highways.', keywords:['rigid pavement','concrete road','PCC','pavement design','joint','slab','road','highway'], revision:2015, department:'IRC', applications:['Expressways','National Highways','Industrial Roads'], relatedCodes:['IRC 37','IRC 15','IS 456'], notes:'Revised 2015 with updated fatigue and temperature considerations.', pdf:'https://www.google.com/search?q=IRC+58+2015+rigid+pavement+highways+PDF' },
  { id:'irc-73', number:'IRC 73', title:'Geometric Design Standards for Rural (Non-Urban) Highways', category:'Transportation & Highway', description:'Provides geometric design standards for alignment, cross-section, junctions and grade for rural highways.', keywords:['geometric design','highway alignment','road geometry','cross section','sight distance','curve','highway','road'], revision:1980, department:'IRC', applications:['Rural Highway Design','State Highway Alignment'], relatedCodes:['IRC 37','IRC 86'], notes:'Covers design speed, sight distance, horizontal and vertical curves.', pdf:'https://www.google.com/search?q=IRC+73+geometric+design+rural+highways+PDF' },
  { id:'irc-78', number:'IRC 78', title:'Standard Specifications for Road Bridges – Foundation and Substructure', category:'Bridge', description:'Covers design requirements for foundations and substructure of road bridges.', keywords:['bridge foundation','pier','abutment','bridge substructure','pile foundation','bridge'], revision:2014, department:'IRC', applications:['Road Bridges','Flyovers','River Bridges'], relatedCodes:['IRC 6','IRC 112','IS 2911'], notes:'Covers pile, well, open and raft foundations for bridges.', pdf:'https://www.google.com/search?q=IRC+78+bridge+foundation+substructure+PDF' },
  { id:'irc-83', number:'IRC 83', title:'Standard Specifications for Road Bridges – Bearings', category:'Bridge', description:'Covers design and installation of elastomeric, PTFE and metallic bearings for road bridges.', keywords:['bridge bearing','elastomeric bearing','pot bearing','PTFE','expansion','bridge support'], revision:2018, department:'IRC', applications:['Bridge Superstructure Support','Flyovers','Viaducts'], relatedCodes:['IRC 6','IRC 78','IRC 112'], notes:'Multi-part code covering different types of bridge bearings.', pdf:'https://www.google.com/search?q=IRC+83+bridge+bearings+PDF' },
  { id:'irc-112', number:'IRC 112', title:'Code of Practice for Concrete Road Bridges', category:'Bridge', description:'Comprehensive limit state design code for concrete road bridges.', keywords:['concrete bridge','limit state','bridge design','prestressed bridge','RCC bridge','eurocode'], revision:2020, department:'IRC', applications:['All Concrete Road Bridges','Major Bridges','Prestressed Bridges'], relatedCodes:['IRC 6','IRC 78','IS 1343'], notes:'Modern code aligned with Eurocodes replacing IRC 21 and IRC 18.', pdf:'https://www.google.com/search?q=IRC+112+2020+concrete+road+bridges+PDF' },
  { id:'irc-103', number:'IRC 103', title:'Guidelines for Pedestrian Facilities', category:'Transportation & Highway', description:'Provides guidelines for design and provision of pedestrian facilities along and across roads.', keywords:['pedestrian','footpath','crosswalk','zebra crossing','pavement','walkway','road'], revision:2012, department:'IRC', applications:['Urban Roads','Pedestrian Infrastructure'], relatedCodes:['IRC 73','IRC 86'], notes:'Includes provisions for differently-abled persons.', pdf:'https://www.google.com/search?q=IRC+103+pedestrian+facilities+PDF' },
  { id:'irc-15', number:'IRC 15', title:'Standard Specifications for Construction of Concrete Roads', category:'Transportation & Highway', description:'Specifies construction procedures, materials and quality control for concrete road pavements.', keywords:['concrete road','rigid pavement','construction','PCC','pavement construction','jointing','highway'], revision:2011, department:'IRC', applications:['Concrete Road Construction','Expressways'], relatedCodes:['IRC 58','IS 456'], notes:'Covers formwork, concrete placement, curing and joint sealing.', pdf:'https://www.google.com/search?q=IRC+15+concrete+road+construction+PDF' },
  { id:'irc-18', number:'IRC 18', title:'Design Criteria for Prestressed Concrete Road Bridges', category:'Bridge', description:'Provides design criteria for prestressed concrete road bridges.', keywords:['prestressed bridge','PSC bridge','road bridge','tendon','prestress'], revision:2000, department:'IRC', applications:['Long Span Bridges','Prestressed Concrete Bridges'], relatedCodes:['IRC 112','IRC 6','IS 1343'], notes:'Largely replaced by IRC 112 for new bridge designs.', pdf:'https://www.google.com/search?q=IRC+18+prestressed+concrete+road+bridges+PDF' },
  { id:'irc-35', number:'IRC 35', title:'Code of Practice for Road Markings', category:'Transportation & Highway', description:'Covers materials, dimensions and applications of road markings.', keywords:['road marking','lane marking','traffic marking','thermoplastic','pavement marking','highway'], revision:1997, department:'IRC', applications:['Highway Road Markings','Urban Road Markings'], relatedCodes:['IRC 70','IRC 73'], notes:'Yellow and white markings differentiated for different purposes.', pdf:'https://www.google.com/search?q=IRC+35+road+markings+PDF' },
  { id:'irc-70', number:'IRC 70', title:'Guidelines on Regulation and Control of Mixed Traffic in Urban Areas', category:'Transportation & Highway', description:'Provides guidelines for traffic management in urban areas with mixed traffic.', keywords:['urban traffic','mixed traffic','traffic control','intersection','signal','traffic management','highway'], revision:1977, department:'IRC', applications:['Urban Traffic Engineering','Intersection Design'], relatedCodes:['IRC 103','IRC 86'], notes:'Addresses unique challenges of Indian mixed traffic conditions.', pdf:'https://www.google.com/search?q=IRC+70+mixed+traffic+urban+PDF' },
  { id:'nbc-2016', number:'NBC 2016', title:'National Building Code of India 2016', category:'Building Planning', description:'Comprehensive model building code providing guidelines for design, construction, materials, and safety of buildings.', keywords:['building code','NBC','national code','building regulation','fire safety','accessibility','structural','building','construction'], revision:2016, department:'BIS', applications:['All Types of Buildings','Urban Planning','Building Permits'], relatedCodes:['IS 456','IS 800','IS 1893','SP 7'], notes:'Multi-volume code covering all aspects of building construction. Updated 2016.', pdf:'https://www.google.com/search?q=National+Building+Code+NBC+2016+India+PDF' },
  { id:'sp-16', number:'SP 16', title:'Design Aids for Reinforced Concrete to IS 456', category:'Concrete', description:'Provides design charts, tables and interaction diagrams for reinforced concrete design as per IS 456.', keywords:['design aid','interaction diagram','chart','table','reinforced concrete','column design','beam design'], revision:1980, department:'BIS', applications:['RCC Design','Column Design','Beam Design'], relatedCodes:['IS 456','IS 1786','SP 34'], notes:'Widely used design handbook for quick reference.', pdf:'https://www.google.com/search?q=SP+16+design+aids+reinforced+concrete+IS456+PDF' },
  { id:'sp-34', number:'SP 34', title:'Handbook on Concrete Reinforcement and Detailing', category:'Concrete', description:'Provides practical guidance on reinforcement detailing for various RCC elements as per IS 456.', keywords:['detailing','reinforcement','bar bending schedule','BBS','lap length','cover','stirrup'], revision:1987, department:'BIS', applications:['RCC Detailing','Bar Bending Schedule'], relatedCodes:['IS 456','SP 16','IS 1786'], notes:'Essential reference for site engineers and draftsmen.', pdf:'https://www.google.com/search?q=SP+34+concrete+reinforcement+detailing+handbook+PDF' },
  { id:'sp-24', number:'SP 24', title:'Explanatory Handbook on IS 456', category:'Concrete', description:'Provides clause-by-clause explanation and commentary on IS 456 with worked examples.', keywords:['IS 456 commentary','explanatory','worked examples','concrete design'], revision:1983, department:'BIS', applications:['Learning IS 456','Teaching Aid'], relatedCodes:['IS 456','SP 16','SP 34'], notes:'Best companion document to IS 456.', pdf:'https://www.google.com/search?q=SP+24+explanatory+handbook+IS+456+PDF' },
  { id:'sp-62', number:'SP 62', title:'Handbook on Building Construction Practices', category:'Construction Management', description:'Comprehensive handbook covering practical aspects of building construction materials and methods.', keywords:['construction practice','building construction','masonry','concrete','finishing','waterproofing'], revision:1997, department:'BIS', applications:['Site Engineers','Contractors','Construction Supervision'], relatedCodes:['IS 456','NBC 2016'], notes:'Practical reference for site supervisors.', pdf:'https://www.google.com/search?q=SP+62+building+construction+practices+handbook+PDF' },
  { id:'sp-7', number:'SP 7', title:'National Building Code – Handbook', category:'Building Planning', description:'Handbook accompanying the National Building Code explaining provisions.', keywords:['building code','NBC','handbook','building regulation','planning'], revision:2005, department:'BIS', applications:['Building Design','Urban Planning'], relatedCodes:['NBC 2016','IS 456','IS 800'], notes:'Companion to NBC for practical application.', pdf:'https://www.google.com/search?q=SP+7+National+Building+Code+handbook+PDF' },
  { id:'sp-6-1', number:'SP 6 Part 1', title:'Handbook for Structural Engineers – Structural Steel Sections', category:'Steel', description:'Provides section properties, tables and design aids for structural steel sections.', keywords:['steel section','I-beam','angle','channel','section properties','moment of inertia','structural steel'], revision:1964, department:'BIS', applications:['Steel Structure Design','Steel Section Selection'], relatedCodes:['IS 800','IS 2062','IS 808'], notes:'Essential reference table book for steel designers.', pdf:'https://www.google.com/search?q=SP+6+structural+steel+sections+handbook+PDF' },
  { id:'sp-27', number:'SP 27', title:'Handbook on Methods of Measurement of Building Works', category:'Construction Management', description:'Provides standard methods of measurement for different items of building construction work.', keywords:['measurement','quantity','billing','BOQ','estimation','construction measurement'], revision:1987, department:'BIS', applications:['Quantity Surveying','Bill of Quantities'], relatedCodes:['SP 62','NBC 2016'], notes:'Standard reference for measurement of all building works.', pdf:'https://www.google.com/search?q=SP+27+measurement+building+works+PDF' },
  { id:'aci-318', number:'ACI 318', title:'Building Code Requirements for Structural Concrete', category:'Concrete', description:'Comprehensive US building code for structural concrete covering design, materials, construction.', keywords:['ACI','concrete','structural concrete','US code','reinforced concrete','limit state','strength design'], revision:2019, department:'ACI', applications:['Buildings','Bridges','Industrial Structures'], relatedCodes:['ACI 301','ACI 211','ACI 224'], notes:'Most widely referenced concrete design code internationally.', pdf:'https://www.google.com/search?q=ACI+318+2019+structural+concrete+PDF+free+download' },
  { id:'aci-301', number:'ACI 301', title:'Specifications for Structural Concrete', category:'Concrete', description:'Specifications for construction of structural concrete covering materials, mixing, placing, curing.', keywords:['concrete specification','ACI','construction concrete','placing concrete','curing'], revision:2016, department:'ACI', applications:['Concrete Construction Specifications'], relatedCodes:['ACI 318','ACI 211'], notes:'Intended for use as a reference in project specifications.', pdf:'https://www.google.com/search?q=ACI+301+specifications+structural+concrete+PDF' },
  { id:'aci-211', number:'ACI 211', title:'Standard Practice for Selecting Proportions for Normal Concrete', category:'Concrete', description:'Provides standard method for proportioning concrete mixtures.', keywords:['mix design','ACI mix','concrete proportioning','water cement ratio','mix proportion'], revision:1991, department:'ACI', applications:['Concrete Mix Design','Quality Control'], relatedCodes:['ACI 318','ACI 301'], notes:'Standard ACI method for mix design, widely used globally.', pdf:'https://www.google.com/search?q=ACI+211+concrete+mix+proportioning+PDF' },
  { id:'aci-224', number:'ACI 224', title:'Control of Cracking in Concrete Structures', category:'Concrete', description:'Provides guidance on causes and control of cracking in concrete structures.', keywords:['crack','cracking','concrete crack','shrinkage crack','crack control','crack width'], revision:2001, department:'ACI', applications:['All Concrete Structures','Durability Design'], relatedCodes:['ACI 318','ACI 301'], notes:'Essential reference for understanding and preventing concrete cracking.', pdf:'https://www.google.com/search?q=ACI+224+cracking+concrete+structures+PDF' },
  { id:'aci-350', number:'ACI 350', title:'Code Requirements for Environmental Engineering Concrete Structures', category:'Water Supply', description:'Code for design of concrete structures used to contain or process water and wastewater.', keywords:['water structure','tank','wastewater','environmental concrete','ACI','liquid retaining'], revision:2006, department:'ACI', applications:['Water Treatment Plants','Sewage Treatment Plants'], relatedCodes:['ACI 318','IS 3370'], notes:'US equivalent of IS 3370 for liquid retaining structures.', pdf:'https://www.google.com/search?q=ACI+350+environmental+concrete+structures+PDF' },
  { id:'aci-440', number:'ACI 440', title:'Guide for Design and Construction with FRP Bars', category:'Concrete', description:'Provides design recommendations for concrete reinforced with fiber-reinforced polymer bars.', keywords:['FRP','fiber reinforced polymer','GFRP','CFRP','corrosion free reinforcement','composite'], revision:2015, department:'ACI', applications:['Marine Structures','Chemically Aggressive Environments'], relatedCodes:['ACI 318'], notes:'FRP bars are non-corrosive alternative to steel reinforcement.', pdf:'https://www.google.com/search?q=ACI+440+FRP+bars+concrete+PDF' },
  { id:'aci-530', number:'ACI 530', title:'Building Code Requirements for Masonry Structures', category:'Masonry', description:'US building code for design and construction of masonry structures.', keywords:['masonry','brick','block','masonry design','ACI','TMS','masonry wall'], revision:2013, department:'ACI', applications:['Masonry Buildings','Masonry Walls'], relatedCodes:['ACI 318','IS 1905'], notes:'Joint code by ACI, ASCE and TMS for masonry design.', pdf:'https://www.google.com/search?q=ACI+530+masonry+structures+building+code+PDF' },
  { id:'aci-562', number:'ACI 562', title:'Code Requirements for Assessment, Repair and Rehabilitation of Existing Concrete Structures', category:'Concrete', description:'Code for evaluation and rehabilitation of existing concrete structures.', keywords:['repair','rehabilitation','existing structure','assessment','retrofit','concrete repair'], revision:2019, department:'ACI', applications:['Structural Repair','Building Renovation'], relatedCodes:['ACI 318','ACI 224'], notes:'First ACI code specifically for existing structure assessment and repair.', pdf:'https://www.google.com/search?q=ACI+562+repair+rehabilitation+concrete+PDF' },
  { id:'astm-c150', number:'ASTM C150', title:'Standard Specification for Portland Cement', category:'Construction Materials', description:'Covers eight types of portland cement including general use, moderate sulfate resistant types.', keywords:['cement','portland cement','ASTM','Type I','Type II','Type III','Type V','sulfate'], revision:2022, department:'ASTM', applications:['Concrete','Mortar','Grout'], relatedCodes:['ACI 318','IS 269'], notes:'Type I/II most common; Type V for sulfate-resistant applications.', pdf:'https://www.google.com/search?q=ASTM+C150+portland+cement+specification+PDF' },
  { id:'astm-c33', number:'ASTM C33', title:'Standard Specification for Concrete Aggregates', category:'Construction Materials', description:'Specifies requirements for fine and coarse aggregates for use in concrete.', keywords:['aggregate','sand','gravel','ASTM','fine aggregate','coarse aggregate','concrete material'], revision:2018, department:'ASTM', applications:['Concrete Production'], relatedCodes:['ASTM C150','ACI 318','IS 383'], notes:'US standard equivalent to IS 383.', pdf:'https://www.google.com/search?q=ASTM+C33+concrete+aggregates+specification+PDF' },
  { id:'astm-a615', number:'ASTM A615', title:'Standard Specification for Deformed and Plain Carbon-Steel Bars for Concrete Reinforcement', category:'Steel', description:'Specifies requirements for deformed and plain steel bars used as concrete reinforcement.', keywords:['rebar','steel bar','reinforcement','ASTM','Grade 60','deformed bar','US steel'], revision:2022, department:'ASTM', applications:['RCC Structures','Buildings','Bridges'], relatedCodes:['ACI 318','IS 1786'], notes:'Grade 60 (420 MPa) most commonly used. Equivalent to IS 1786 Fe500.', pdf:'https://www.google.com/search?q=ASTM+A615+deformed+steel+bars+reinforcement+PDF' },
  { id:'astm-d1143', number:'ASTM D1143', title:'Standard Test Methods for Deep Foundation Elements Under Static Axial Compressive Load', category:'Foundation & Geotechnical', description:'Covers procedures for static load testing of deep foundation elements.', keywords:['pile load test','static load test','deep foundation','axial load','settlement','ASTM'], revision:2007, department:'ASTM', applications:['Pile Load Testing','Foundation Verification'], relatedCodes:['IS 2911'], notes:'Multiple test methods including maintained load and quick load tests.', pdf:'https://www.google.com/search?q=ASTM+D1143+pile+load+test+PDF' },
  { id:'en-1992-1', number:'EN 1992-1-1', title:'Eurocode 2: Design of Concrete Structures – General Rules and Rules for Buildings', category:'Concrete', description:'European standard for design of concrete structures covering materials, structural analysis and detailing.', keywords:['Eurocode','concrete design','European standard','EN','limit state','structural analysis'], revision:2004, department:'CEN', applications:['All Concrete Structures in Europe'], relatedCodes:['EN 1990','EN 1991','EN 1997'], notes:'Part of the Eurocode suite, widely referenced internationally.', pdf:'https://www.google.com/search?q=Eurocode+2+EN+1992+concrete+structures+PDF+free' },
  { id:'en-1993-1', number:'EN 1993-1-1', title:'Eurocode 3: Design of Steel Structures – General Rules and Rules for Buildings', category:'Steel', description:'European standard for design of steel structures including cross-section classification and member design.', keywords:['Eurocode','steel design','European standard','structural steel','EN'], revision:2005, department:'CEN', applications:['All Steel Structures in Europe'], relatedCodes:['EN 1990','EN 1991','EN 1992'], notes:'Comprehensive steel design code based on limit state philosophy.', pdf:'https://www.google.com/search?q=Eurocode+3+EN+1993+steel+structures+PDF+free' },
  { id:'en-1997-1', number:'EN 1997-1', title:'Eurocode 7: Geotechnical Design – General Rules', category:'Foundation & Geotechnical', description:'European standard for geotechnical design covering foundations, retaining structures and embankments.', keywords:['Eurocode','geotechnical','foundation design','retaining wall','slope stability','EN'], revision:2004, department:'CEN', applications:['Foundation Design','Retaining Structures'], relatedCodes:['EN 1990','EN 1992'], notes:'Introduces reliability-based approach to geotechnical design.', pdf:'https://www.google.com/search?q=Eurocode+7+EN+1997+geotechnical+design+PDF' },
  { id:'en-1998-1', number:'EN 1998-1', title:'Eurocode 8: Design of Structures for Earthquake Resistance – General Rules', category:'Earthquake', description:'European standard for seismic design of buildings and civil engineering works.', keywords:['Eurocode','seismic design','earthquake','EN','response spectrum','ductility'], revision:2004, department:'CEN', applications:['Seismic Zone Buildings','Bridges in Seismic Areas'], relatedCodes:['EN 1992','EN 1993','IS 1893'], notes:'Comprehensive seismic design framework for European practice.', pdf:'https://www.google.com/search?q=Eurocode+8+EN+1998+earthquake+resistance+PDF' },
  { id:'bs-8110-1', number:'BS 8110 Part 1', title:'Structural Use of Concrete – Code of Practice for Design and Construction', category:'Concrete', description:'British standard for structural use of concrete (now superseded by Eurocode 2).', keywords:['British standard','concrete design','BS','UK','structural concrete','limit state'], revision:1997, department:'BSI', applications:['Concrete Structures in UK'], relatedCodes:['EN 1992','ACI 318','IS 456'], notes:'Largely replaced by Eurocode 2 (EN 1992) in UK since 2010.', pdf:'https://www.google.com/search?q=BS+8110+structural+concrete+design+PDF' },
  { id:'bs-5950-1', number:'BS 5950 Part 1', title:'Structural Use of Steelwork in Building – Code of Practice for Design', category:'Steel', description:'British standard for structural use of steelwork in buildings (now superseded by Eurocode 3).', keywords:['British standard','steel design','BS','UK','structural steel','limit state'], revision:2000, department:'BSI', applications:['Steel Structures in UK'], relatedCodes:['EN 1993','IS 800'], notes:'Superseded by Eurocode 3 (EN 1993) in UK practice.', pdf:'https://www.google.com/search?q=BS+5950+structural+steelwork+design+PDF' },
  { id:'iso-9001', number:'ISO 9001', title:'Quality Management Systems – Requirements', category:'Quality Control', description:'Specifies requirements for a quality management system for consistent product/service quality.', keywords:['quality management','QMS','ISO','quality system','audit','certification','quality control'], revision:2015, department:'ISO', applications:['Construction Companies','Consultants','Contractors'], relatedCodes:['ISO 14001','ISO 45001'], notes:'Required by major clients for contractor prequalification.', pdf:'https://www.google.com/search?q=ISO+9001+2015+quality+management+PDF+free' },
  { id:'iso-14001', number:'ISO 14001', title:'Environmental Management Systems – Requirements with Guidance', category:'Environmental', description:'Specifies requirements for an environmental management system to improve environmental performance.', keywords:['environmental management','EMS','ISO','environmental','sustainability','green'], revision:2015, department:'ISO', applications:['Construction Projects','Industrial Plants'], relatedCodes:['ISO 9001','ISO 45001'], notes:'Increasingly mandated for large infrastructure projects.', pdf:'https://www.google.com/search?q=ISO+14001+2015+environmental+management+PDF' },
  { id:'is-1893-2', number:'IS 1893 Part 2', title:'Criteria for Earthquake Resistant Design – Liquid Retaining Tanks', category:'Earthquake', description:'Specifies seismic design requirements for liquid retaining tanks and vessels.', keywords:['seismic tank','earthquake tank','liquid tank','impulsive','convective','sloshing'], revision:2014, department:'BIS', applications:['Water Tanks in Seismic Zones'], relatedCodes:['IS 1893 Part 1','IS 3370','IS 456'], notes:'Accounts for impulsive and convective forces due to liquid sloshing.', pdf:'https://www.google.com/search?q=IS+1893+Part+2+liquid+retaining+tanks+seismic+PDF' },
  { id:'is-1893-3', number:'IS 1893 Part 3', title:'Criteria for Earthquake Resistant Design – Bridges and Retaining Walls', category:'Earthquake', description:'Specifies seismic design requirements for bridges and retaining structures.', keywords:['earthquake','seismic bridge','retaining wall seismic','bridge design','seismic zone'], revision:2014, department:'BIS', applications:['Road Bridges in Seismic Zones','Retaining Walls'], relatedCodes:['IS 1893 Part 1','IRC 6','IRC 112'], notes:'Part of IS 1893 series for specific structure types.', pdf:'https://www.google.com/search?q=IS+1893+Part+3+bridges+retaining+walls+seismic+PDF' },
  { id:'is-808', number:'IS 808', title:'Dimensions for Hot Rolled Steel Beam, Column, Channel and Angle Sections', category:'Steel', description:'Specifies dimensions and section properties of hot rolled steel sections used in India.', keywords:['steel section','ISMB','ISMC','ISWA','ISHB','beam section','column section','angle section'], revision:1989, department:'BIS', applications:['Steel Structure Design','Section Selection'], relatedCodes:['IS 800','IS 2062','SP 6'], notes:'Provides standard Indian steel section designations.', pdf:'https://www.google.com/search?q=IS+808+hot+rolled+steel+sections+PDF' },
  { id:'is-4031', number:'IS 4031', title:'Methods of Physical Tests for Hydraulic Cement', category:'Construction Materials', description:'Specifies methods of tests for consistency, setting time, soundness, compressive strength of cement.', keywords:['cement test','vicat','setting time','soundness','fineness','strength test','cement quality'], revision:1988, department:'BIS', applications:['Cement Quality Control','Material Testing Laboratory'], relatedCodes:['IS 269','IS 8112','IS 12269'], notes:'Multi-part standard covering all cement test methods.', pdf:'https://www.google.com/search?q=IS+4031+cement+physical+tests+PDF' },
  { id:'is-5816', number:'IS 5816', title:'Method of Test for Splitting Tensile Strength of Concrete Cylinder', category:'Concrete', description:'Specifies the split cylinder test for determining tensile strength of concrete.', keywords:['splitting tensile','tensile strength','concrete','cylinder test','split test'], revision:1999, department:'BIS', applications:['Concrete Characterization','Research','Quality Control'], relatedCodes:['IS 516','IS 456'], notes:'Also called Brazilian test. Indirect measure of concrete tensile strength.', pdf:'https://www.google.com/search?q=IS+5816+splitting+tensile+strength+concrete+PDF' },
  { id:'is-13311-1', number:'IS 13311 Part 1', title:'Non-Destructive Testing of Concrete – Ultrasonic Pulse Velocity', category:'Concrete', description:'Specifies use of ultrasonic pulse velocity (UPV) method for assessing concrete quality.', keywords:['NDT','non destructive test','ultrasonic','UPV','concrete quality','pulse velocity'], revision:1992, department:'BIS', applications:['Existing Structure Evaluation','Quality Control','Crack Detection'], relatedCodes:['IS 13311 Part 2','IS 456','IS 516'], notes:'UPV test assesses uniformity and relative quality of concrete.', pdf:'https://www.google.com/search?q=IS+13311+Part+1+UPV+concrete+NDT+PDF' },
  { id:'is-13311-2', number:'IS 13311 Part 2', title:'Non-Destructive Testing of Concrete – Rebound Hammer', category:'Concrete', description:'Specifies use of rebound hammer for non-destructive estimation of concrete strength.', keywords:['rebound hammer','Schmidt hammer','NDT','non destructive','concrete strength estimation'], revision:1992, department:'BIS', applications:['In-situ Strength Assessment','Existing Structures'], relatedCodes:['IS 13311 Part 1','IS 456','IS 516'], notes:'Quick and inexpensive but less accurate than core testing.', pdf:'https://www.google.com/search?q=IS+13311+Part+2+rebound+hammer+concrete+PDF' },
  { id:'is-15988', number:'IS 15988', title:'Seismic Evaluation and Strengthening of Existing Reinforced Concrete Buildings', category:'Earthquake', description:'Guidelines for seismic evaluation and retrofit of existing RC buildings.', keywords:['seismic retrofit','strengthening','existing building','earthquake','assessment','vulnerability'], revision:2013, department:'BIS', applications:['Old Building Retrofit','Heritage Structure Strengthening'], relatedCodes:['IS 1893','IS 13920','IS 456'], notes:'Important for upgrading pre-code buildings to meet seismic requirements.', pdf:'https://www.google.com/search?q=IS+15988+seismic+evaluation+RC+buildings+PDF' },
  { id:'is-2185-1', number:'IS 2185 Part 1', title:'Concrete Masonry Units – Hollow and Solid Concrete Blocks', category:'Masonry', description:'Specifies requirements for hollow and solid load-bearing and non-load-bearing concrete blocks.', keywords:['concrete block','hollow block','masonry unit','CMU','solid block','block masonry'], revision:2005, department:'BIS', applications:['Wall Construction','Load Bearing Walls'], relatedCodes:['IS 1905','IS 2250','IS 456'], notes:'Faster construction than brick masonry with larger block sizes.', pdf:'https://www.google.com/search?q=IS+2185+concrete+masonry+blocks+PDF' },
  { id:'is-6006', number:'IS 6006', title:'Specification for Uncoated Stress Relieved Strand for Prestressed Concrete', category:'Prestressed Concrete', description:'Specifies requirements for high tensile steel strands used in prestressed concrete.', keywords:['strand','tendon','prestress wire','high tensile','prestressed concrete','7-wire strand'], revision:1983, department:'BIS', applications:['Post-tensioned Bridges','Prestressed Girders'], relatedCodes:['IS 1343','IS 9399'], notes:'7-wire strand is most commonly used prestressing tendon.', pdf:'https://www.google.com/search?q=IS+6006+prestressing+strand+PDF' },
  { id:'is-9399', number:'IS 9399', title:'Specification for Prestressing Anchorages', category:'Prestressed Concrete', description:'Specifies requirements for anchorage systems used in prestressed concrete construction.', keywords:['prestress anchorage','post-tension anchor','tendon','anchor block','prestressing'], revision:1979, department:'BIS', applications:['Post-tensioned Bridges','Prestressed Concrete Structures'], relatedCodes:['IS 1343','IS 6006'], notes:'Covers both internal and external tendon anchorage systems.', pdf:'https://www.google.com/search?q=IS+9399+prestressing+anchorages+PDF' },
  { id:'is-14268', number:'IS 14268', title:'Uncoated Stress-Relieved Low Relaxation Seven-Ply Strand for Prestressed Concrete', category:'Prestressed Concrete', description:'Specifies requirements for low relaxation prestressing strands with improved properties.', keywords:['low relaxation strand','LR strand','prestress','tendon','7-wire','high tensile'], revision:1995, department:'BIS', applications:['Modern Prestressed Bridges','Long Span Structures'], relatedCodes:['IS 6006','IS 1343'], notes:'Low relaxation strands have replaced normal relaxation in modern practice.', pdf:'https://www.google.com/search?q=IS+14268+low+relaxation+strand+prestressed+PDF' },
  { id:'irc-86', number:'IRC 86', title:'Geometric Design Standards for Urban Roads', category:'Transportation & Highway', description:'Provides geometric design standards for urban roads including lane widths, medians and footpaths.', keywords:['urban road','geometric design','lane width','median','footpath','parking','road cross section','highway'], revision:1983, department:'IRC', applications:['Urban Road Design','City Roads','Arterial Roads'], relatedCodes:['IRC 73','IRC 103','IRC 70'], notes:'Design standards differ from rural roads due to pedestrian and mixed traffic.', pdf:'https://www.google.com/search?q=IRC+86+geometric+design+urban+roads+PDF' },
  { id:'irc-24', number:'IRC 24', title:'Standard Specifications for Road Bridges – Steel Road Bridges', category:'Bridge', description:'Code of practice for design of steel road bridges.', keywords:['steel bridge','road bridge','bridge girder','truss bridge','plate girder'], revision:2010, department:'IRC', applications:['Long Span Steel Bridges','Rail-Road Bridges'], relatedCodes:['IRC 6','IRC 78','IS 800'], notes:'Covers plate girder, truss and composite steel bridges.', pdf:'https://www.google.com/search?q=IRC+24+steel+road+bridges+PDF' },
  { id:'irc-116', number:'IRC 116', title:'Geometric Design of Grade Separators', category:'Transportation & Highway', description:'Provides geometric design standards for grade separators including interchanges and flyovers.', keywords:['grade separator','interchange','flyover','overpass','underpass','grade separation','highway'], revision:2014, department:'IRC', applications:['Highway Interchanges','Urban Grade Separators'], relatedCodes:['IRC 73','IRC 86','IRC 6'], notes:'Covers cloverleaf, diamond, trumpet and other interchange types.', pdf:'https://www.google.com/search?q=IRC+116+grade+separators+geometric+design+PDF' },
  { id:'is-3812', number:'IS 3812', title:'Fly Ash for Use as Pozzolana and Admixture – Specification', category:'Construction Materials', description:'Specifies requirements for fly ash used as pozzolana in cement and concrete.', keywords:['fly ash','pozzolana','admixture','supplementary cementitious','SCM','blended concrete'], revision:2003, department:'BIS', applications:['High Volume Fly Ash Concrete','Embankments'], relatedCodes:['IS 456','IS 1489','IS 10262'], notes:'Fly ash replacement up to 35% allowed in concrete as per IS 456.', pdf:'https://www.google.com/search?q=IS+3812+fly+ash+pozzolana+admixture+PDF' },
  { id:'is-16700', number:'IS 16700', title:'Criteria for Structural Safety of Tall Concrete Buildings', category:'Structural Engineering', description:'Provides criteria for structural safety of tall concrete buildings above 50m height.', keywords:['tall building','high rise','skyscraper','structural safety','wind','seismic','drift'], revision:2017, department:'BIS', applications:['High Rise Buildings above 50m','Skyscrapers'], relatedCodes:['IS 456','IS 1893','IS 875 Part 3'], notes:"India's first dedicated tall building design standard.", pdf:'https://www.google.com/search?q=IS+16700+tall+concrete+buildings+structural+safety+PDF' },
  { id:'is-2645', number:'IS 2645', title:'Specification for Integral Cement Waterproofing Compounds', category:'Concrete', description:'Specifies requirements for integral waterproofing compounds added to cement concrete and mortar.', keywords:['waterproofing','integral waterproofing','admixture','watertight concrete','waterproof compound'], revision:2003, department:'BIS', applications:['Water Retaining Structures','Basement Construction'], relatedCodes:['IS 9103','IS 456','IS 1166'], notes:'Integral compounds reduce permeability of concrete.', pdf:'https://www.google.com/search?q=IS+2645+integral+waterproofing+compounds+PDF' },
  { id:'is-14179-1', number:'IS 14179 Part 1', title:'Recommendation for Design and Construction of Underground Structures', category:'Tunnel', description:'Provides recommendations for design and construction of underground structures and tunnels.', keywords:['tunnel','underground','excavation','lining','NATM','rock tunnel','soil tunnel'], revision:1994, department:'BIS', applications:['Road Tunnels','Railway Tunnels','Metro Tunnels'], relatedCodes:['IS 456','IS 2911','IS 3764'], notes:"India's tunneling activity increasing with metro and highway projects.", pdf:'https://www.google.com/search?q=IS+14179+underground+tunnel+design+PDF' },
  { id:'iso-19650', number:'ISO 19650', title:'Organization and Digitization of Information about Buildings – BIM', category:'BIM', description:'International standard for managing information across the whole life cycle of a built asset using BIM.', keywords:['BIM','building information modelling','digital twin','ISO','information management','CDE'], revision:2018, department:'ISO', applications:['Large Infrastructure Projects','Government Buildings'], relatedCodes:['ISO 9001','NBC 2016'], notes:'Increasingly mandated for government infrastructure projects globally.', pdf:'https://www.google.com/search?q=ISO+19650+BIM+building+information+modelling+PDF' },
  { id:'is-15883', number:'IS 15883', title:'Green Building Rating – Code of Practice', category:'Green Building', description:'Provides framework and criteria for green building rating and certification.', keywords:['green building','sustainability','IGBC','GRIHA','energy efficiency','water conservation'], revision:2010, department:'BIS', applications:['Green Certified Buildings','Sustainable Construction'], relatedCodes:['NBC 2016','ISO 14001'], notes:"India's own green building standard alongside IGBC/GRIHA.", pdf:'https://www.google.com/search?q=IS+15883+green+building+rating+PDF' },
  { id:'is-3764', number:'IS 3764', title:'Safety Code for Excavation Work', category:'Construction Management', description:'Provides safety requirements for excavation work in construction projects.', keywords:['excavation','safety','trench','shoring','slope protection','construction safety'], revision:1992, department:'BIS', applications:['Foundation Excavation','Underground Works','Pipeline Trenches'], relatedCodes:['IS 3696','IS 4082'], notes:'Critical for preventing excavation collapses and worker safety.', pdf:'https://www.google.com/search?q=IS+3764+excavation+safety+code+PDF' },
  { id:'is-2911-3', number:'IS 2911 Part 3', title:'Design and Construction of Pile Foundations – Under-Reamed Piles', category:'Foundation & Geotechnical', description:'Covers design and construction of under-reamed pile foundations for expansive soil areas.', keywords:['under-reamed pile','expansive soil','black cotton soil','pile foundation','bulb pile'], revision:1980, department:'BIS', applications:['Expansive Soil Areas','Black Cotton Soil Regions'], relatedCodes:['IS 2911 Part 1 Sec 1','IS 6403','IS 1904'], notes:'Very common in Deccan plateau regions with expansive black cotton soil.', pdf:'https://www.google.com/search?q=IS+2911+Part+3+under+reamed+piles+PDF' },
  { id:'is-2911-4', number:'IS 2911 Part 4', title:'Load Testing of Piles', category:'Foundation & Geotechnical', description:'Specifies procedures for load testing of pile foundations to verify design capacity.', keywords:['pile load test','static pile test','load testing','pile capacity','settlement','pile test'], revision:1985, department:'BIS', applications:['Pile Foundation Verification'], relatedCodes:['IS 2911 Part 1 Sec 1','IS 6403'], notes:'Maintained load test and cyclic load test procedures covered.', pdf:'https://www.google.com/search?q=IS+2911+Part+4+pile+load+testing+PDF' },
  { id:'is-8329', number:'IS 8329', title:'Centrifugally Cast Ductile Iron Pressure Pipes – Specification', category:'Water Supply', description:'Specifies requirements for ductile iron pipes used in water supply and sewerage systems.', keywords:['ductile iron pipe','DI pipe','water main','pressure pipe','water supply pipe'], revision:2000, department:'BIS', applications:['Water Distribution Networks','High Pressure Water Mains'], relatedCodes:['IS 1172','IS 10500'], notes:'DI pipes replacing cast iron pipes due to better strength.', pdf:'https://www.google.com/search?q=IS+8329+ductile+iron+pipes+PDF' },
  { id:'is-1239', number:'IS 1239', title:'Mild Steel Tubes, Tubulars and Other Wrought Steel Fittings – Specification', category:'Water Supply', description:'Specifies requirements for mild steel tubes and fittings for water, gas and sanitary services.', keywords:['MS pipe','GI pipe','mild steel tube','water pipe','galvanized pipe','plumbing'], revision:2004, department:'BIS', applications:['Plumbing','Water Distribution','Gas Supply'], relatedCodes:['IS 1172','IS 1742'], notes:'GI pipes most common for domestic water supply.', pdf:'https://www.google.com/search?q=IS+1239+mild+steel+tubes+pipes+PDF' },
  { id:'is-11861', number:'IS 11861', title:'Specification for Micro Silica for Use with Ordinary Portland Cement', category:'Construction Materials', description:'Specifies requirements for micro silica (silica fume) used as supplementary cementitious material.', keywords:['silica fume','micro silica','SCM','pozzolan','high performance concrete','reactive silica'], revision:1986, department:'BIS', applications:['High Performance Concrete','Marine Concrete'], relatedCodes:['IS 456','IS 10262','IS 3812'], notes:'Improves strength, durability and reduces permeability significantly.', pdf:'https://www.google.com/search?q=IS+11861+micro+silica+silica+fume+cement+PDF' },
  { id:'is-7861-1', number:'IS 7861 Part 1', title:'Code of Practice for Extreme Weather Concreting – Concreting in Hot Weather', category:'Concrete', description:'Covers precautions and practices for concreting in hot and dry weather conditions.', keywords:['hot weather concrete','temperature','precaution','concreting','rapid evaporation','retarder'], revision:1975, department:'BIS', applications:['Summer Concreting','Arid Climate Construction'], relatedCodes:['IS 456','IS 7861 Part 2','IS 9103'], notes:"India's hot climate makes this standard important for quality concrete.", pdf:'https://www.google.com/search?q=IS+7861+hot+weather+concreting+PDF' },
  { id:'is-4923', number:'IS 4923', title:'Hollow Steel Sections for Structural Use – Specification', category:'Steel', description:'Specifies requirements for cold and hot formed hollow steel sections (tubes) for structural use.', keywords:['hollow section','RHS','SHS','CHS','tube','structural tube','square hollow section'], revision:1997, department:'BIS', applications:['Space Frames','Columns','Trusses'], relatedCodes:['IS 800','IS 2062'], notes:'RHS, SHS and CHS sections with better torsional properties.', pdf:'https://www.google.com/search?q=IS+4923+hollow+steel+sections+structural+PDF' },
  { id:'is-15916', number:'IS 15916', title:'Building Design and Construction – Accessibility and Usability of Built Environment', category:'Building Planning', description:'Specifies requirements for accessibility of buildings for persons with disabilities.', keywords:['accessibility','disabled','wheelchair','ramp','barrier free','universal design','PwD'], revision:2010, department:'BIS', applications:['All Public Buildings','Government Buildings','Hospitals'], relatedCodes:['NBC 2016','SP 7'], notes:'Mandated by Rights of Persons with Disabilities Act 2016.', pdf:'https://www.google.com/search?q=IS+15916+accessibility+buildings+disabled+PDF' },
  { id:'is-16172', number:'IS 16172', title:'Reinforcement Couplers for Mechanical Splices of Bars in Concrete', category:'Concrete', description:'Specifies requirements for mechanical couplers used to splice reinforcing bars in concrete.', keywords:['coupler','mechanical splice','rebar coupler','bar splice','reinforcement joint'], revision:2014, department:'BIS', applications:['High Rise Buildings','Seismic Zones'], relatedCodes:['IS 456','IS 1786','IS 13920'], notes:'Threaded couplers eliminate need for lap splices in congested areas.', pdf:'https://www.google.com/search?q=IS+16172+reinforcement+couplers+mechanical+splices+PDF' },
  { id:'irc-sp-84', number:'IRC SP 84', title:'Manual of Specifications and Standards for Expressways', category:'Transportation & Highway', description:'Comprehensive specifications and standards for design and construction of expressways.', keywords:['expressway','highway specification','access controlled road','toll road','national expressway','highway'], revision:2014, department:'IRC', applications:['National Expressway Design','Greenfield Highways'], relatedCodes:['IRC 37','IRC 73','IRC 58'], notes:'Covers geometric, pavement, bridge and safety requirements for expressways.', pdf:'https://www.google.com/search?q=IRC+SP+84+expressway+specifications+PDF' },
  { id:'astm-e119', number:'ASTM E119', title:'Standard Test Methods for Fire Tests of Building Construction and Materials', category:'Fire Safety', description:'Covers procedures for fire resistance testing of building assemblies and materials.', keywords:['fire test','fire resistance','fire rating','ASTM','fire safety','structural fire'], revision:2022, department:'ASTM', applications:['Building Materials Testing','Fire Safety Compliance'], relatedCodes:['IS 1641','NBC 2016'], notes:'Standard fire exposure curve used as basis for fire resistance ratings.', pdf:'https://www.google.com/search?q=ASTM+E119+fire+tests+building+construction+PDF' },
  { id:'is-1642', number:'IS 1642', title:'Fire Safety of Buildings – Details of Construction', category:'Fire Safety', description:'Covers fire safety requirements for construction details including fire stops and compartmentation.', keywords:['fire stop','fire door','fire compartment','fire wall','fire barrier','fire safety construction'], revision:1989, department:'BIS', applications:['All Buildings','High Rise Buildings'], relatedCodes:['IS 1641','NBC 2016'], notes:'Compartmentation limits fire spread within buildings.', pdf:'https://www.google.com/search?q=IS+1642+fire+safety+buildings+details+PDF' }
];

/* ── State ── */
const state = {
  codes: [],
  filtered: [],
  bookmarks: new Set(JSON.parse(localStorage.getItem('ce_bookmarks') || '[]')),
  history: JSON.parse(localStorage.getItem('ce_history') || '[]'),
  recentlyViewed: JSON.parse(localStorage.getItem('ce_recent') || '[]'),
  query: '',
  category: '',
  dept: '',
  sort: 'relevance',
  viewMode: 'grid',
  activePanel: null,
  modalCodeId: null,
};

/* ── Category accent colours ── */
const CAT_COLOURS = {
  'Concrete': '#58a6ff',
  'Steel': '#f78166',
  'Foundation & Geotechnical': '#3fb950',
  'Bridge': '#d2a8ff',
  'Transportation & Highway': '#ffa657',
  'Earthquake': '#ff7b72',
  'Wind': '#79c0ff',
  'Water Supply': '#79c0ff',
  'Wastewater': '#56d364',
  'Building Planning': '#e3b341',
  'Construction Materials': '#f0883e',
  'Fire Safety': '#ff6e6e',
  'Masonry': '#e3b341',
  'Timber': '#56d364',
  'Prestressed Concrete': '#bc8cff',
  'Structural Engineering': '#58a6ff',
  'Quality Control': '#a5f3fc',
  'Green Building': '#4ade80',
  'BIM': '#39d353',
  'Environmental': '#6ee7b7',
  'Construction Management': '#fbbf24',
  'Tunnel': '#94a3b8',
};
function accentFor(cat) { return CAT_COLOURS[cat] || '#8b949e'; }

/* ── DOM refs ── */
const $ = (id) => document.getElementById(id);
const el = {
  searchInput:    $('searchInput'),
  searchClear:    $('searchClear'),
  categoryFilter: $('categoryFilter'),
  deptFilter:     $('deptFilter'),
  sortSelect:     $('sortSelect'),
  resetFilters:   $('resetFilters'),
  cardsGrid:      $('cardsGrid'),
  noResults:      $('noResults'),
  loadingGrid:    $('loadingGrid'),
  resultCount:    $('resultCount'),
  showAllBtn:     $('showAllBtn'),
  scrollTop:      $('scrollTop'),
  bookmarksBtn:   $('bookmarksBtn'),
  bookmarkBadge:  $('bookmarkBadge'),
  historyBtn:     $('historyBtn'),
  bookmarksPanel: $('bookmarksPanel'),
  bookmarksList:  $('bookmarksList'),
  historyPanel:   $('historyPanel'),
  historyList:    $('historyList'),
  closeBookmarks: $('closeBookmarksBtn'),
  closeHistory:   $('closeHistoryBtn'),
  clearBookmarks: $('clearBookmarksBtn'),
  clearHistory:   $('clearHistoryBtn'),
  exportPdf:      $('exportPdfBtn'),
  overlay:        $('overlay'),
  modalBackdrop:  $('modalBackdrop'),
  modalClose:     $('modalClose'),
  modalContent:   $('modalContent'),
  themeToggle:    $('themeToggle'),
  iconMoon:       document.querySelector('.icon-moon'),
  iconSun:        document.querySelector('.icon-sun'),
  toast:          $('toast'),
  gridViewBtn:    $('gridViewBtn'),
  listViewBtn:    $('listViewBtn'),
  shortcutsModal: $('shortcutsModal'),
  shortcutsClose:    $('shortcutsClose'),
  chips:             document.querySelectorAll('.chip'),
  /* PDF viewer */
  pdfBackdrop:       $('pdfViewerBackdrop'),
  pdfCodeNum:        $('pdfViewerCodeNum'),
  pdfTitle:          $('pdfViewerTitle'),
  pdfRenderArea:     $('pdfRenderArea'),
  pdfLoadingState:   $('pdfLoadingState'),
  pdfNaState:        $('pdfNaState'),
  pdfNaPath:         $('pdfNaPath'),
  pdfCloseBtn:       $('pdfCloseBtn'),
  pdfPrintBtn:       $('pdfPrintBtn'),
  pdfDownloadBtn:    $('pdfDownloadBtn'),
  pdfZoomInBtn:      $('pdfZoomInBtn'),
  pdfZoomOutBtn:     $('pdfZoomOutBtn'),
  pdfFitBtn:         $('pdfFitBtn'),
  pdfZoomLabel:      $('pdfZoomLabel'),
};

/* ============================================================
   INIT — try fetch first, fall back to embedded data
   ============================================================ */
async function init() {
  try {
    const res = await fetch('codes.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    state.codes = await res.json();
    console.log('[CE CodeBook] Loaded', state.codes.length, 'codes from codes.json');
  } catch (err) {
    /* fetch fails on file:// in Chrome — use embedded fallback */
    console.warn('[CE CodeBook] fetch() failed (' + err.message + '), using embedded data.');
    state.codes = CODES_FALLBACK;
  }

  /* Normalise every code's pdf field to a clean local path */
  state.codes.forEach((c) => { c.pdf = getPdfPath(c); });

  /* Hide skeleton, render all codes */
  el.loadingGrid.style.display = 'none';
  applyFilters();
  renderBookmarkBadge();
  renderBookmarksList();
  renderHistoryList();
  bindEvents();
  applyStoredTheme();
}

/* ============================================================
   SEARCH + FILTER  (fixed: case-insensitive, all fields)
   ============================================================ */
function applyFilters() {
  const q   = state.query.trim().toLowerCase();
  const cat = state.category.trim();   /* exact match from <select> */
  const dept = state.dept.trim();

  let results = state.codes.filter((code) => {
    /* 1. Category: exact match */
    if (cat && code.category !== cat) return false;

    /* 2. Department: exact match */
    if (dept && code.department !== dept) return false;

    /* 3. Full-text search across ALL fields */
    if (q) {
      const haystack = [
        code.number       || '',
        code.title        || '',
        code.category     || '',
        code.description  || '',
        code.department   || '',
        String(code.revision || ''),
        Array.isArray(code.keywords) ? code.keywords.join(' ') : '',
        Array.isArray(code.applications) ? code.applications.join(' ') : '',
        Array.isArray(code.relatedCodes) ? code.relatedCodes.join(' ') : '',
        code.notes        || '',
      ].join(' ').toLowerCase();

      /* Support multi-word queries: every word must appear somewhere */
      const words = q.split(/\s+/).filter(Boolean);
      if (!words.every((w) => haystack.includes(w))) return false;
    }

    return true;
  });

  /* Sorting */
  if (state.sort === 'relevance' && q) {
    results = results.map((code) => {
      const num   = (code.number || '').toLowerCase();
      const title = (code.title  || '').toLowerCase();
      const kw    = Array.isArray(code.keywords) ? code.keywords.join(' ').toLowerCase() : '';
      let score = 0;
      if (num === q)              score += 100;
      else if (num.startsWith(q)) score += 60;
      else if (num.includes(q))   score += 30;
      if (title.includes(q))      score += 20;
      if (kw.includes(q))         score += 10;
      return { ...code, _score: score };
    }).sort((a, b) => b._score - a._score);
  } else if (state.sort === 'number') {
    results = [...results].sort((a, b) => (a.number || '').localeCompare(b.number || ''));
  } else if (state.sort === 'revision') {
    results = [...results].sort((a, b) => (b.revision || 0) - (a.revision || 0));
  } else if (state.sort === 'category') {
    results = [...results].sort((a, b) => (a.category || '').localeCompare(b.category || ''));
  }

  state.filtered = results;
  renderCards();
}

/* ============================================================
   RENDER CARDS
   ============================================================ */
function renderCards() {
  const grid = el.cardsGrid;
  const { filtered } = state;

  if (filtered.length === 0) {
    grid.innerHTML = '';
    el.noResults.hidden = false;
    el.resultCount.textContent = 'No codes found';
    return;
  }

  el.noResults.hidden = true;
  const q = state.query.trim().toLowerCase();
  el.resultCount.textContent =
    `${filtered.length} code${filtered.length === 1 ? '' : 's'} found`;

  grid.innerHTML = filtered.map((code, i) => {
    const accent      = accentFor(code.category);
    const isBookmarked = state.bookmarks.has(code.id);
    const keywords    = (code.keywords || []).slice(0, 5);
    const delay       = Math.min(i * 25, 500);
    const pdfLabel = '📄 View PDF';

    return `
    <article class="code-card" role="listitem"
      style="--card-accent:${accent}; animation-delay:${delay}ms"
      data-id="${code.id}" tabindex="0"
      aria-label="${escHtml(code.number)}: ${escHtml(code.title)}">

      <div class="card-header">
        <div class="card-number">${highlightText(code.number, q)}</div>
        <div class="card-actions">
          <button class="card-btn ${isBookmarked ? 'bookmarked' : ''}"
            title="${isBookmarked ? 'Remove bookmark' : 'Bookmark'}"
            data-action="bookmark" data-id="${code.id}">
            ${isBookmarked ? '★' : '☆'}
          </button>
          <button class="card-btn" title="Copy code number"
            data-action="copy" data-number="${escHtml(code.number)}">📋</button>
          <button class="card-btn" title="View details"
            data-action="detail" data-id="${code.id}">↗</button>
        </div>
      </div>

      <div class="card-title">${highlightText(code.title, q)}</div>
      <div class="card-description">${escHtml(code.description)}</div>

      <div class="card-meta">
        <span class="tag tag-category">${escHtml(code.category)}</span>
        <span class="tag tag-dept">${escHtml(code.department)}</span>
        <span class="tag tag-year">Rev. ${code.revision}</span>
      </div>

      <div class="card-keywords">
        ${keywords.map((k) => `<span class="keyword">${escHtml(k)}</span>`).join('')}
      </div>

      <div class="card-footer">
        <button class="btn-pdf" data-action="pdf" data-id="${code.id}" title="Open PDF viewer">
          ${pdfLabel}
        </button>
      </div>
    </article>`;
  }).join('');

  grid.onclick   = handleCardClick;
  grid.onkeydown = (e) => { if (e.key === 'Enter') handleCardClick(e); };
}

function highlightText(text, q) {
  if (!q || q.length < 1) return escHtml(text);
  const safe  = escHtml(text);
  const words = q.split(/\s+/).filter((w) => w.length > 1);
  if (!words.length) return safe;
  const pattern = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  return safe.replace(new RegExp(`(${pattern})`, 'gi'),
    '<mark style="background:rgba(88,166,255,0.22);color:inherit;border-radius:3px;padding:0 1px">$1</mark>');
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function handleCardClick(e) {
  const btn = e.target.closest('[data-action]');
  if (btn) {
    e.stopPropagation();
    const { action, id, number: num } = btn.dataset;
    if (action === 'bookmark') toggleBookmark(id);
    if (action === 'copy')     copyCodeNumber(num);
    if (action === 'detail')   openModal(id);
    if (action === 'pdf') {
      const code = state.codes.find((c) => c.id === id);
      if (code) openPdfViewer(code);
    }
    return;
  }
  const card = e.target.closest('.code-card');
  if (card) openModal(card.dataset.id);
}

/* ============================================================
   MODAL
   ============================================================ */
function openModal(id) {
  const code = state.codes.find((c) => c.id === id);
  if (!code) return;
  state.modalCodeId = id;
  addRecentlyViewed(id);

  const accent       = accentFor(code.category);
  const isBookmarked = state.bookmarks.has(id);

  /* Find smart related codes: same category + explicit relatedCodes list */
  const explicitRelated = (code.relatedCodes || []);
  const categoryRelated = state.codes
    .filter((c) => c.id !== id && c.category === code.category)
    .slice(0, 5)
    .map((c) => c.number)
    .filter((n) => !explicitRelated.includes(n));
  const allRelated = [...new Set([...explicitRelated, ...categoryRelated])].slice(0, 10);

  el.modalContent.innerHTML = `
    <div style="height:4px;background:${accent};margin:-24px -28px 20px;border-radius:12px 12px 0 0"></div>
    <div class="modal-number" style="color:${accent}">${escHtml(code.number)}</div>
    <div class="modal-title">${escHtml(code.title)}</div>

    <div class="modal-section">
      <div class="modal-section-title">Overview</div>
      <div class="modal-description">${escHtml(code.description)}</div>
    </div>

    <div class="modal-section">
      <div class="modal-section-title">Details</div>
      <div class="modal-meta-grid">
        <div class="meta-item"><div class="meta-label">Category</div>
          <div class="meta-value" style="color:${accent}">${escHtml(code.category)}</div></div>
        <div class="meta-item"><div class="meta-label">Department</div>
          <div class="meta-value">${escHtml(code.department)}</div></div>
        <div class="meta-item"><div class="meta-label">Latest Revision</div>
          <div class="meta-value">${code.revision}</div></div>
        <div class="meta-item"><div class="meta-label">Code Number</div>
          <div class="meta-value">${escHtml(code.number)}</div></div>
      </div>
    </div>

    ${(code.applications||[]).length ? `
    <div class="modal-section">
      <div class="modal-section-title">Applications</div>
      <ul class="modal-list">
        ${code.applications.map((a) => `<li>${escHtml(a)}</li>`).join('')}
      </ul>
    </div>` : ''}

    ${(code.keywords||[]).length ? `
    <div class="modal-section">
      <div class="modal-section-title">Keywords</div>
      <div class="modal-tags">
        ${code.keywords.map((k) => `<span class="modal-tag">${escHtml(k)}</span>`).join('')}
      </div>
    </div>` : ''}

    ${code.notes ? `
    <div class="modal-section">
      <div class="modal-section-title">Notes</div>
      <div class="modal-note">💡 ${escHtml(code.notes)}</div>
    </div>` : ''}

    ${allRelated.length ? `
    <div class="modal-section">
      <div class="modal-section-title">Related Codes</div>
      <div class="modal-related">
        ${allRelated.map((r) => `<button class="related-code" data-related="${escHtml(r)}">${escHtml(r)}</button>`).join('')}
      </div>
    </div>` : ''}

    <div class="modal-section">
      <div class="modal-section-title">PDF Document</div>
      <div class="modal-pdf-row">
        <button class="modal-btn primary" id="modalPdfViewBtn">📄 View PDF</button>
        <span class="pdf-note">📂 File: <code>${escHtml(getPdfPath(code))}</code></span>
      </div>
    </div>

    <div class="modal-actions">
      <button class="modal-btn ${isBookmarked ? 'bookmarked-btn' : ''}" id="modalBookmarkBtn">
        ${isBookmarked ? '★ Bookmarked' : '☆ Bookmark'}
      </button>
      <button class="modal-btn" id="modalCopyBtn">📋 Copy Number</button>
      <button class="modal-btn" id="modalPrintBtn">🖨 Print</button>
    </div>
  `;

  /* Related code click → search */
  el.modalContent.querySelectorAll('.related-code').forEach((btn) => {
    btn.addEventListener('click', () => {
      closeModal();
      const q = btn.dataset.related;
      el.searchInput.value = q;
      el.searchClear.hidden = false;
      state.query = q;
      applyFilters();
      addHistory(q);
    });
  });

  $('modalPdfViewBtn').addEventListener('click', () => { closeModal(); openPdfViewer(code); });
  $('modalBookmarkBtn').addEventListener('click', () => {
    toggleBookmark(id);
    const now = state.bookmarks.has(id);
    $('modalBookmarkBtn').textContent = now ? '★ Bookmarked' : '☆ Bookmark';
    $('modalBookmarkBtn').classList.toggle('bookmarked-btn', now);
  });
  $('modalCopyBtn').addEventListener('click', () => copyCodeNumber(code.number));
  $('modalPrintBtn').addEventListener('click', () => printCode(code));

  el.modalBackdrop.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  el.modalBackdrop.hidden = true;
  document.body.style.overflow = '';
  state.modalCodeId = null;
}

/* ============================================================
   PDF VIEWER  — renders local pdfs/ files inside an <embed> modal
   ============================================================
   Root causes of the previous blank-PDF bug — all fixed here:
   1. transform:scale() on iframes causes Chrome PDF plugin to go blank.
      Fix: use <embed> with NO CSS transforms; use #zoom= URL hash for zoom.
   2. Appending ?v=1 breaks browser PDF content-type sniffing.
      Fix: pass clean path with only a # hash fragment (never ?query).
   3. fetch() throws on file:// → old code returned true (assumed exists)
      → loaded a blank embed for a non-existent file.
      Fix: on file://, skip the existence check and show a clear notice.
   4. .pdf-viewer-container had no explicit height so flex:1 on the body
      collapsed to 0px.  Fix: height set in CSS (see style.css).
   ============================================================ */

let _pdfZoom   = 100;           /* current zoom level as integer percent */
let _pdfPath   = '';            /* path of the PDF currently loaded      */
const _pdfCache = {};           /* path → 'ok' | 'missing'               */

/* ── Open viewer ── */
function openPdfViewer(code) {
  const path = getPdfPath(code);
  _pdfPath = path;

  /* Reset UI */
  el.pdfCodeNum.textContent         = code.number;
  el.pdfTitle.textContent           = code.title;
  el.pdfNaPath.textContent          = path;
  el.pdfNaState.hidden              = true;
  el.pdfLoadingState.style.display  = 'flex';
  _clearPdfEmbed();
  _pdfZoom = 100;
  el.pdfZoomLabel.textContent = '100%';

  el.pdfBackdrop.hidden        = false;
  document.body.style.overflow = 'hidden';

  /* Already known missing → show error immediately */
  if (_pdfCache[path] === 'missing') { _showPdfNotAvailable(path); return; }

  /* On file:// protocol fetch is unreliable — skip existence check,
     try loading directly and show a notice about using a server */
  if (window.location.protocol === 'file:') {
    _renderPdfEmbed(path);
    showToast('Tip: run via local server for best PDF support');
    return;
  }

  /* On http:// — verify the file exists first */
  fetch(path, { method: 'HEAD', cache: 'no-store' })
    .then((r) => {
      if (!r.ok) { _pdfCache[path] = 'missing'; _showPdfNotAvailable(path); return; }
      _pdfCache[path] = 'ok';
      _renderPdfEmbed(path);
    })
    .catch(() => {
      /* Unexpected network error — try loading anyway */
      _renderPdfEmbed(path);
    });
}

/* ── Render the PDF using <embed> (no CSS transforms — that's what caused blank) ── */
function _renderPdfEmbed(path) {
  const area = el.pdfRenderArea;

  /* Build the hash fragment: #toolbar=1&zoom=100 */
  const hash  = `#toolbar=1&navpanes=1&zoom=${_pdfZoom}`;

  /* <embed> is the most cross-browser compatible tag for inline PDFs.
     Do NOT apply transform:scale() — it causes blank rendering in Chrome. */
  const embed = document.createElement('embed');
  embed.setAttribute('src',  path + hash);
  embed.setAttribute('type', 'application/pdf');
  embed.style.cssText = 'width:100%;height:100%;border:none;display:block;';

  area.innerHTML = '';
  area.appendChild(embed);
  area.style.display = 'block';

  el.pdfLoadingState.style.display = 'none';
}

/* ── Clear the embed area ── */
function _clearPdfEmbed() {
  const area = el.pdfRenderArea;
  if (area) { area.innerHTML = ''; area.style.display = 'none'; }
}

/* ── Not-available state ── */
function _showPdfNotAvailable(path) {
  el.pdfLoadingState.style.display = 'none';
  _clearPdfEmbed();
  el.pdfNaPath.textContent = path;
  el.pdfNaState.hidden     = false;
  console.warn('[CE CodeBook] PDF not found:', path);
}

/* ── Close viewer ── */
function closePdfViewer() {
  el.pdfBackdrop.hidden        = false;   /* keep backdrop hidden flag correct */
  el.pdfBackdrop.hidden        = true;
  _clearPdfEmbed();                       /* frees browser PDF plugin memory   */
  document.body.style.overflow = '';
  _pdfPath = '';
}

/* ── Zoom: reload embed with updated #zoom= hash (no CSS transforms) ── */
function _applyZoom() {
  el.pdfZoomLabel.textContent = _pdfZoom + '%';
  if (!_pdfPath) return;
  const area  = el.pdfRenderArea;
  const embed = area.querySelector('embed');
  if (embed) {
    /* Replace only the hash — never add ? query string */
    const basePath = embed.src.split('#')[0];
    embed.src = basePath + `#toolbar=1&navpanes=1&zoom=${_pdfZoom}`;
  }
}

function zoomIn()  { _pdfZoom = Math.min(_pdfZoom + 15, 300); _applyZoom(); }
function zoomOut() { _pdfZoom = Math.max(_pdfZoom - 15,  50); _applyZoom(); }
function zoomFit() { _pdfZoom = 100; _applyZoom(); }

/* ── Print (try iframe contentWindow, fall back to new tab) ── */
function printPdf() {
  if (!_pdfPath) { showToast('No PDF loaded'); return; }
  /* Open in a new tab and trigger print — most reliable cross-browser */
  const w = window.open(_pdfPath, '_blank');
  if (w) { w.addEventListener('load', () => { try { w.print(); } catch (_) {} }); }
  else   { showToast('Allow pop-ups to print the PDF'); }
}

/* ── Download ── */
function downloadPdf() {
  if (!_pdfPath) { showToast('No PDF loaded'); return; }
  const a = document.createElement('a');
  a.href     = _pdfPath;
  a.download = _pdfPath.split('/').pop();
  document.body.appendChild(a);
  a.click();
  a.remove();
  showToast('Downloading ' + a.download);
}

function printCode(code) {
  const pdfUrl   = getPdfUrl(code);
  const pdfLabel = hasPdf(code) ? `<a href="${escHtml(pdfUrl)}">View PDF</a>` : `<a href="${escHtml(pdfUrl)}" target="_blank">Search PDF Online</a>`;
  const w = window.open('', '_blank');
  w.document.write(`
    <html><head><title>${code.number}</title>
    <style>
      body{font-family:sans-serif;max-width:700px;margin:40px auto;color:#1c2128}
      h1{color:#1e40af;font-size:2rem;margin-bottom:4px}
      h2{font-size:1rem;margin:0 0 16px;color:#555;font-weight:500}
      .meta{display:flex;gap:12px;flex-wrap:wrap;margin:16px 0;font-size:.82rem;color:#555}
      .meta span{background:#f0f4f8;padding:4px 10px;border-radius:4px}
      .section{margin-top:20px}.section h3{font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:#888;margin-bottom:8px;border-bottom:1px solid #e2e8f0;padding-bottom:4px}
      ul{padding-left:1.2em}li{margin:4px 0;font-size:.88rem}
      .note{background:#fffbeb;border:1px solid #fcd34d;border-radius:6px;padding:10px 14px;font-size:.82rem}
      a{color:#1e40af}
      @media print{body{margin:10px}}
    </style></head><body>
    <h1>${code.number}</h1><h2>${code.title}</h2>
    <div class="meta">
      <span>📁 ${code.category}</span>
      <span>🏛 ${code.department}</span>
      <span>📅 Rev. ${code.revision}</span>
    </div>
    <div class="section"><h3>Description</h3><p>${code.description}</p></div>
    ${(code.applications||[]).length?`<div class="section"><h3>Applications</h3><ul>${code.applications.map(a=>`<li>${a}</li>`).join('')}</ul></div>`:''}
    ${code.notes?`<div class="section"><h3>Notes</h3><div class="note">${code.notes}</div></div>`:''}
    ${(code.relatedCodes||[]).length?`<div class="section"><h3>Related Codes</h3><p>${code.relatedCodes.join(', ')}</p></div>`:''}
    <div class="section"><h3>PDF</h3>${pdfLabel}</div>
    <script>window.onload=()=>window.print()<\/script>
    </body></html>`);
  w.document.close();
}

/* ============================================================
   BOOKMARKS
   ============================================================ */
function toggleBookmark(id) {
  if (state.bookmarks.has(id)) {
    state.bookmarks.delete(id);
    showToast('Bookmark removed');
  } else {
    state.bookmarks.add(id);
    showToast('Code bookmarked ★');
  }
  localStorage.setItem('ce_bookmarks', JSON.stringify([...state.bookmarks]));
  renderBookmarkBadge();
  renderBookmarksList();

  /* Update card button if visible */
  const cardBtn = el.cardsGrid.querySelector(`[data-action="bookmark"][data-id="${id}"]`);
  if (cardBtn) {
    const isNow = state.bookmarks.has(id);
    cardBtn.textContent = isNow ? '★' : '☆';
    cardBtn.classList.toggle('bookmarked', isNow);
  }
}

function renderBookmarkBadge() {
  const n = state.bookmarks.size;
  el.bookmarkBadge.textContent = n;
  el.bookmarkBadge.hidden = n === 0;
}

function renderBookmarksList() {
  if (state.bookmarks.size === 0) {
    el.bookmarksList.innerHTML =
      '<p class="panel-empty">No bookmarks yet.<br/>Click ☆ on any code card to save it.</p>';
    return;
  }
  el.bookmarksList.innerHTML = [...state.bookmarks].map((id) => {
    const code = state.codes.find((c) => c.id === id);
    if (!code) return '';
    return `
      <div class="bookmark-item" data-id="${id}" role="button" tabindex="0">
        <div class="bookmark-info">
          <div class="bookmark-number">${escHtml(code.number)}</div>
          <div class="bookmark-title">${escHtml(code.title)}</div>
        </div>
        <button class="bookmark-remove" data-remove="${id}" title="Remove">✕</button>
      </div>`;
  }).join('');
  el.bookmarksList.onclick = (e) => {
    const rm = e.target.closest('[data-remove]');
    if (rm) { toggleBookmark(rm.dataset.remove); return; }
    const it = e.target.closest('.bookmark-item');
    if (it) { closePanel(); openModal(it.dataset.id); }
  };
}

function exportBookmarksPdf() {
  if (!state.bookmarks.size) { showToast('No bookmarks to export'); return; }
  const codes = [...state.bookmarks].map((id) => state.codes.find((c) => c.id === id)).filter(Boolean);
  const w = window.open('', '_blank');
  w.document.write(`<html><head><title>Bookmarked Codes</title>
    <style>body{font-family:sans-serif;max-width:750px;margin:40px auto}
    h1{color:#1e40af;margin-bottom:20px}
    .code{border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:14px;break-inside:avoid}
    .num{font-size:1.2rem;font-weight:800;color:#1e40af}.title{font-weight:600;margin:4px 0 8px}
    .desc{font-size:.85rem;color:#555;line-height:1.6}
    .meta{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;font-size:.73rem;color:#777}
    .meta span{background:#f0f4f8;padding:2px 8px;border-radius:4px}
    @media print{body{margin:10px}}</style></head><body>
    <h1>📚 Bookmarked Civil Engineering Codes</h1>
    ${codes.map(c=>`<div class="code"><div class="num">${c.number}</div><div class="title">${c.title}</div><div class="desc">${c.description}</div><div class="meta"><span>${c.category}</span><span>${c.department}</span><span>Rev. ${c.revision}</span></div></div>`).join('')}
    <script>window.onload=()=>window.print()<\/script></body></html>`);
  w.document.close();
}

/* ============================================================
   HISTORY
   ============================================================ */
function addHistory(query) {
  if (!query || query.trim().length < 2) return;
  const entry = { q: query.trim(), time: Date.now() };
  state.history = [entry, ...state.history.filter((h) => h.q !== entry.q)].slice(0, 30);
  localStorage.setItem('ce_history', JSON.stringify(state.history));
  renderHistoryList();
}

function renderHistoryList() {
  if (!state.history.length) {
    el.historyList.innerHTML = '<p class="panel-empty">No search history yet.</p>';
    return;
  }
  el.historyList.innerHTML = state.history.map((h) =>
    `<div class="history-item" data-q="${escHtml(h.q)}" role="button" tabindex="0">
      <span class="history-item-text">🔍 ${escHtml(h.q)}</span>
      <span class="history-item-time">${timeAgo(h.time)}</span>
    </div>`).join('');
  el.historyList.onclick = (e) => {
    const item = e.target.closest('.history-item');
    if (!item) return;
    const q = item.dataset.q;
    el.searchInput.value = q;
    el.searchClear.hidden = false;
    state.query = q;
    applyFilters();
    closePanel();
  };
}

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)    return 'just now';
  if (s < 3600)  return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

function addRecentlyViewed(id) {
  state.recentlyViewed = [id, ...state.recentlyViewed.filter((x) => x !== id)].slice(0, 10);
  localStorage.setItem('ce_recent', JSON.stringify(state.recentlyViewed));
}

/* ============================================================
   PANELS
   ============================================================ */
function openPanel(name) {
  closePanel();
  state.activePanel = name;
  if (name === 'bookmarks') el.bookmarksPanel.hidden = false;
  if (name === 'history')   el.historyPanel.hidden = false;
  el.overlay.hidden = false;
  document.body.style.overflow = 'hidden';
}
function closePanel() {
  state.activePanel = null;
  el.bookmarksPanel.hidden = true;
  el.historyPanel.hidden = true;
  el.overlay.hidden = true;
  document.body.style.overflow = '';
}

/* ============================================================
   THEME
   ============================================================ */
function applyStoredTheme() {
  const saved = localStorage.getItem('ce_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}
function toggleTheme() {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('ce_theme', next);
  updateThemeIcon(next);
}
function updateThemeIcon(theme) {
  if (el.iconMoon) el.iconMoon.style.display = theme === 'dark' ? '' : 'none';
  if (el.iconSun)  el.iconSun.style.display  = theme === 'light' ? '' : 'none';
}

/* ============================================================
   TOAST
   ============================================================ */
let _toastTimer;
function showToast(msg) {
  el.toast.textContent = msg;
  el.toast.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.toast.classList.remove('show'), 2200);
}

/* ============================================================
   UTILITIES
   ============================================================ */
function copyCodeNumber(number) {
  navigator.clipboard?.writeText(number)
    .then(() => showToast(`Copied "${number}"`))
    .catch(() => showToast('Copy failed — try Ctrl+C'));
}

function getPdfUrl(code) {
  if (code.pdf) return code.pdf;
  const q = encodeURIComponent((code.number || '') + ' ' + (code.department || '') + ' standard PDF download');
  return `https://www.google.com/search?q=${q}`;
}
function hasPdf(code) { return !!code.pdf; }

/* ============================================================
   EVENT BINDING
   ============================================================ */
function bindEvents() {
  /* Debounced search */
  let _timer;
  el.searchInput.addEventListener('input', (e) => {
    const val = e.target.value;
    el.searchClear.hidden = !val;
    clearTimeout(_timer);
    _timer = setTimeout(() => {
      state.query = val;
      applyFilters();
      if (val.trim().length >= 2) addHistory(val.trim());
    }, 160);
  });

  el.searchClear.addEventListener('click', () => {
    el.searchInput.value = '';
    el.searchClear.hidden = true;
    state.query = '';
    el.chips.forEach((c) => c.classList.remove('active'));
    applyFilters();
    el.searchInput.focus();
  });

  el.categoryFilter.addEventListener('change', (e) => {
    state.category = e.target.value;
    applyFilters();
  });
  el.deptFilter.addEventListener('change', (e) => {
    state.dept = e.target.value;
    applyFilters();
  });
  el.sortSelect.addEventListener('change', (e) => {
    state.sort = e.target.value;
    applyFilters();
  });
  el.resetFilters.addEventListener('click', resetAll);
  el.showAllBtn.addEventListener('click', resetAll);

  /* Quick chips */
  el.chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const wasActive = chip.classList.contains('active');
      el.chips.forEach((c) => c.classList.remove('active'));
      if (wasActive) {
        el.searchInput.value = '';
        el.searchClear.hidden = true;
        state.query = '';
      } else {
        chip.classList.add('active');
        const q = chip.dataset.query;
        el.searchInput.value = q;
        el.searchClear.hidden = false;
        state.query = q;
        addHistory(q);
      }
      applyFilters();
    });
  });

  /* View toggle */
  el.gridViewBtn.addEventListener('click', () => setView('grid'));
  el.listViewBtn.addEventListener('click', () => setView('list'));

  /* Scroll to top */
  window.addEventListener('scroll', () => { el.scrollTop.hidden = window.scrollY < 400; }, { passive: true });
  el.scrollTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* Panels */
  el.bookmarksBtn.addEventListener('click', () =>
    state.activePanel === 'bookmarks' ? closePanel() : openPanel('bookmarks'));
  el.historyBtn.addEventListener('click', () =>
    state.activePanel === 'history' ? closePanel() : openPanel('history'));
  el.closeBookmarks.addEventListener('click', closePanel);
  el.closeHistory.addEventListener('click', closePanel);
  el.overlay.addEventListener('click', () => { if (state.activePanel) closePanel(); else closeModal(); });
  el.clearBookmarks.addEventListener('click', () => {
    state.bookmarks.clear();
    localStorage.removeItem('ce_bookmarks');
    renderBookmarkBadge();
    renderBookmarksList();
    renderCards();
    showToast('All bookmarks cleared');
  });
  el.clearHistory.addEventListener('click', () => {
    state.history = [];
    localStorage.removeItem('ce_history');
    renderHistoryList();
    showToast('History cleared');
  });
  el.exportPdf.addEventListener('click', exportBookmarksPdf);

  /* Modal */
  el.modalClose.addEventListener('click', closeModal);
  el.modalBackdrop.addEventListener('click', (e) => { if (e.target === el.modalBackdrop) closeModal(); });

  /* PDF Viewer */
  el.pdfCloseBtn.addEventListener('click', closePdfViewer);
  el.pdfBackdrop.addEventListener('click', (e) => { if (e.target === el.pdfBackdrop) closePdfViewer(); });
  el.pdfZoomInBtn.addEventListener('click',  zoomIn);
  el.pdfZoomOutBtn.addEventListener('click', zoomOut);
  el.pdfFitBtn.addEventListener('click',     zoomFit);
  el.pdfPrintBtn.addEventListener('click',   printPdf);
  el.pdfDownloadBtn.addEventListener('click', () => { downloadPdf(); });

  /* Theme */
  el.themeToggle.addEventListener('click', toggleTheme);

  /* Shortcuts modal */
  el.shortcutsClose.addEventListener('click', () => { el.shortcutsModal.hidden = true; });

  /* Keyboard shortcuts */
  document.addEventListener('keydown', (e) => {
    const inInput = ['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName);
    if (e.key === 'Escape') {
      if (!el.pdfBackdrop.hidden)   { closePdfViewer(); return; }
      if (!el.modalBackdrop.hidden) { closeModal(); return; }
      if (state.activePanel)        { closePanel(); return; }
      if (!el.shortcutsModal.hidden){ el.shortcutsModal.hidden = true; return; }
    }
    if (inInput) return;
    if (e.key === '/') { e.preventDefault(); el.searchInput.focus(); el.searchInput.select(); }
    if (e.key === 'b' || e.key === 'B') state.activePanel === 'bookmarks' ? closePanel() : openPanel('bookmarks');
    if (e.key === 'h' || e.key === 'H') state.activePanel === 'history'   ? closePanel() : openPanel('history');
    if (e.key === 't' || e.key === 'T') toggleTheme();
    if (e.key === '?') el.shortcutsModal.hidden = !el.shortcutsModal.hidden;
  });
}

function resetAll() {
  el.searchInput.value   = '';
  el.searchClear.hidden  = true;
  el.categoryFilter.value = '';
  el.deptFilter.value    = '';
  el.sortSelect.value    = 'relevance';
  el.chips.forEach((c) => c.classList.remove('active'));
  Object.assign(state, { query:'', category:'', dept:'', sort:'relevance' });
  applyFilters();
}

function setView(mode) {
  state.viewMode = mode;
  el.cardsGrid.classList.toggle('list-view', mode === 'list');
  el.gridViewBtn.classList.toggle('active', mode === 'grid');
  el.listViewBtn.classList.toggle('active', mode === 'list');
}

/* ── Start ── */
document.addEventListener('DOMContentLoaded', init);
