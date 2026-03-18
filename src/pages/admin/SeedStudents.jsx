import { useEffect, useState } from 'react';
import { db, collection, addDoc, getDocs } from '../../firebase';

const STUDENTS = [
  { regNo: '820423205001', name: 'ABINASH M' },
  { regNo: '820423205002', name: 'ABISHEK S' },
  { regNo: '820423205003', name: 'ADITHYAN M' },
  { regNo: '820423205004', name: 'AFRANA RENOSE B' },
  { regNo: '820423205005', name: 'AHILAN M' },
  { regNo: '820423205006', name: 'AISATH DELISHA K' },
  { regNo: '820423205007', name: 'AJAY V' },
  { regNo: '820423205008', name: 'AJAY LAKHSMANA' },
  { regNo: '820423205000', name: 'AKALYAR' },
  { regNo: '820423205010', name: 'AKASH M' },
  { regNo: '820423205011', name: 'ARCHANA K' },
  { regNo: '820423205012', name: 'ARSATH MOHAMED' },
  { regNo: '820423205013', name: 'ASHIKA A' },
  { regNo: '820423205014', name: 'ASIKA M' },
  { regNo: '820423205015', name: 'ATCHAYA THARASI' },
  { regNo: '820423205016', name: 'BALAJI P' },
  { regNo: '820423205017', name: 'BALAJI S L' },
  { regNo: '820423205018', name: 'BALAMURUGAN A' },
  { regNo: '820423205019', name: 'BALAMURUGAN K' },
  { regNo: '820423205020', name: 'BHARATHI SAHAN' },
  { regNo: '820423205021', name: 'BHAVANA B' },
  { regNo: '820423205022', name: 'DEEPANRAJ K' },
  { regNo: '820423205023', name: 'DHAARANI V' },
  { regNo: '820423205024', name: 'DHATCHINESWAR' },
  { regNo: '820423205025', name: 'DHEEPIKA S' },
  { regNo: '820423205026', name: 'DHINAKARAN S' },
  { regNo: '820423205027', name: 'DINESH KUMAR S' },
  { regNo: '820423205028', name: 'DURGADEVI K' },
  { regNo: '820423205029', name: 'DURGASRI S' },
  { regNo: '820423205030', name: 'GOPIKA R' },
  { regNo: '820423205031', name: 'GOPIKA S' },
  { regNo: '820423205032', name: 'HARIKRISHNAN G' },
  { regNo: '820423205033', name: 'HARINE R' },
  { regNo: '820423205034', name: 'HASBEN FARHANA' },
  { regNo: '820423205035', name: 'JAYASREE J' },
  { regNo: '820423205036', name: 'KABILAN B' },
  { regNo: '820423205037', name: 'KALAISELVI M' },
  { regNo: '820423205038', name: 'KANISHKA SHRI K' },
  { regNo: '820423205039', name: 'KAVIBHARATHI S' },
  { regNo: '820423205040', name: 'KAVIYARASAN L' },
  { regNo: '820423205041', name: 'KAVYA V' },
  { regNo: '820423205042', name: 'KAVYA V' },
  { regNo: '820423205043', name: 'KISHORE R' },
  { regNo: '820423205044', name: 'LAKSHMI NANDHINI' },
  { regNo: '820423205045', name: 'LAVANYA K' },
  { regNo: '820423205046', name: 'MAHESWARAN S V' },
  { regNo: '820423205047', name: 'MANIKANDAN C' },
  { regNo: '820423205048', name: 'MANOJKUMAR M' },
  { regNo: '820423205049', name: 'MOHAMED FARHAN' },
  { regNo: '820423205050', name: 'MOHAMED RAZEEN' },
  { regNo: '820423205051', name: 'MOHAMED RIYAZ' },
  { regNo: '820423205052', name: 'MOHANA A' },
  { regNo: '820423205053', name: 'NANDHA KUMAR P' },
  { regNo: '820423205054', name: 'NANDHAKUMAR A' },
  { regNo: '820423205055', name: 'NANDHINI S' },
  { regNo: '820423205056', name: 'NIKITHA S' },
  { regNo: '820423205057', name: 'NILANCHANA B' },
  { regNo: '820423205058', name: 'NISHANTH S' },
  { regNo: '820423205059', name: 'PAGALAVAN B' },
  { regNo: '820423205060', name: 'PRABU M' },
  { regNo: '820423205061', name: 'PRAKASH V' },
  { regNo: '820423205062', name: 'PRAVEEN P' },
  { regNo: '820423205063', name: 'PRAVEENA K' },
  { regNo: '820423205064', name: 'PRAVEEN RAJ J' },
  { regNo: '820423205065', name: 'PRAVINKKUMAR A' },
  { regNo: '820423205066', name: 'PRIYADHARSHINI S' },
  { regNo: '820423205067', name: 'PRIYAN K' },
  { regNo: '820423205068', name: 'PRIYASAKI J' },
  { regNo: '820423205069', name: 'RAMYA S' },
  { regNo: '820423205070', name: 'RESHMA S' },
  { regNo: '820423205071', name: 'SANDHURU KUMAR' },
  { regNo: '820423205072', name: 'SANTHOSHINI S' },
  { regNo: '820423205073', name: 'SANTHOSH KUMAR' },
  { regNo: '820423205074', name: 'SHIVARANJANAN' },
  { regNo: '820423205075', name: 'SITHARTH K T' },
  { regNo: '820423205076', name: 'SIVAGURUNATHAN' },
  { regNo: '820423205077', name: 'SIVANESAN S' },
  { regNo: '820423205078', name: 'SOWBHARANIKA R' },
  { regNo: '820423205079', name: 'SRI VIDYALAKSHM' },
  { regNo: '820423205080', name: 'SUBHIKSHA J' },
  { regNo: '820423205081', name: 'SUDHARSAN S' },
  { regNo: '820423205082', name: 'SWATHI R' },
  { regNo: '820423205083', name: 'THARANEESWARI' },
  { regNo: '820423205084', name: 'VAISHNAVI S' },
  { regNo: '820423205085', name: 'VASANTH V' },
  { regNo: '820423205086', name: 'VEERAMANIKAND' },
  { regNo: '820423205087', name: 'VENGATESH K' },
  { regNo: '820423205088', name: 'VIGNESH VEERA M' },
  { regNo: '820423205090', name: 'VINEGHA P' },
  { regNo: '820423205091', name: 'YOGALAKSHMI K' },
  { regNo: '820423205092', name: 'YOGESH S' },
  { regNo: '820423205301', name: 'RAGUL M' },
  { regNo: '820423205302', name: 'SANTHOSH N' },
];

function SeedStudents() {
  const [status, setStatus] = useState('Checking...');
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const seed = async () => {
      try {
        // Check if students already exist
        const existing = await getDocs(collection(db, 'students'));
        if (existing.size > 0) {
          setStatus(`Already seeded (${existing.size} students exist). No action taken.`);
          setDone(true);
          return;
        }

        setStatus('Seeding students...');
        let count = 0;

        for (let i = 0; i < STUDENTS.length; i++) {
          const student = STUDENTS[i];
          // First 46 entries (index 0-45) → IT-1, rest → IT-2
          const section = i < 46 ? 'IT-1' : 'IT-2';

          await addDoc(collection(db, 'students'), {
            regNo: student.regNo,
            name: student.name,
            section: section,
            year: '3rd Year'
          });

          count++;
          setProgress(count);
          setStatus(`Added ${count} / ${STUDENTS.length} students...`);
        }

        setStatus(`✅ Done! Added ${count} students successfully.`);
        setDone(true);
      } catch (err) {
        setStatus(`❌ Error: ${err.message}`);
        setDone(true);
      }
    };

    seed();
  }, []);

  return (
    <div style={{ padding: '4rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '2rem' }}>Student Data Seeder</h1>
      <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{status}</p>
      {!done && (
        <div style={{ background: '#f1f5f9', borderRadius: '100px', height: '12px', overflow: 'hidden', marginTop: '1rem' }}>
          <div style={{
            width: `${(progress / STUDENTS.length) * 100}%`,
            height: '100%',
            background: 'var(--primary)',
            borderRadius: '100px',
            transition: 'width 0.3s ease'
          }} />
        </div>
      )}
      {done && (
        <a href="/admin/students" style={{ display: 'inline-block', marginTop: '2rem', color: 'var(--primary)', fontWeight: '700' }}>
          → Go to Manage Students
        </a>
      )}
    </div>
  );
}

export default SeedStudents;
