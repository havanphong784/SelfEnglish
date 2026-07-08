import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Save, AlertCircle } from 'lucide-react';
import { fetchWithAuth } from '../../utils/api';
import { Button, Panel } from '../../components/ui/Primitives';

const ImportVocabulary = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [wordsPreview, setWordsPreview] = useState([]);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleVocabularyFile = (file) => {
    if (!file) return;

    setError(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        
        if (!Array.isArray(jsonData)) {
          setError('File JSON cần là một danh sách từ vựng.');
          setWordsPreview([]);
          return;
        }

        const isValid = jsonData.every(item => item.word && item.meaning);
        if (!isValid) {
          setError("Mỗi từ cần có ít nhất 'word' và 'meaning'.");
          setWordsPreview([]);
          return;
        }

        setWordsPreview(jsonData);
        // Tự động lấy tên file làm tên gói nếu chưa có
        if (!title) {
           const fileName = file.name.replace('.json', '');
           setTitle(fileName.charAt(0).toUpperCase() + fileName.slice(1));
        }
      } catch (err) {
        console.error('Lỗi khi đọc file:', err);
        setError('File chưa đúng định dạng JSON. Kiểm tra lại rồi tải lên nhé.');
        setWordsPreview([]);
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e) => {
    handleVocabularyFile(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleVocabularyFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (wordsPreview.length === 0) {
      setError('Bạn cần tải lên file JSON chứa danh sách từ trước đã.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await fetchWithAuth('/vocabularies/import', {
        method: 'POST',
        body: JSON.stringify({ 
          words: wordsPreview,
          title: title
        })
      });
      
      navigate('/dashboard/vocabulary');
    } catch (err) {
      console.error('Lỗi khi lưu gói từ vựng:', err);
      setError('Chưa lưu được gói từ. Thử lại sau một chút nhé.');
    } finally {
      setLoading(false);
    }
  };

  const templateJson = `[
  {
    "word": "Diligent",
    "meaning": "Siêng năng, cần cù",
    "ipa": "/ˈdɪlɪdʒənt/",
    "example": "He is a diligent student."
  }
]`;

  return (
    <div className="se-shell pt-4  max-w-3xl space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Button
          onClick={() => navigate('/dashboard/vocabulary')}
          variant="ghost"
          size="icon"
          aria-label="Quay lại kho từ"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h1 className="se-page-title">Thêm gói từ vựng</h1>
          <p className="se-body mt-2 text-sm">Tải file JSON lên để tạo gói từ mới. Nhanh gọn, khỏi nhập tay từng từ.</p>
        </div>
      </div>

      <Panel>
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div>
            <label className="se-label mb-2">Tên gói từ</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="se-input text-lg"
              placeholder="VD: IELTS Core Words"
            />
          </div>

          <div className="space-y-4">
            <label className="se-label mb-2">File từ vựng</label>
            <label
              className={`block w-full cursor-pointer rounded-xl border-2 border-dashed py-10 text-center text-foreground transition-transform hover:-translate-y-1 ${isDragging ? 'border-accent bg-white shadow-[0_8px_0_#111827]' : 'border-primary bg-storybook-green'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-3">
                <Upload className="w-10 h-10 mb-1" />
                <span className="text-lg font-black">Tải file JSON lên</span>
                <span className="text-sm font-bold text-muted-foreground">Kéo thả vào đây cũng được, rất tiện.</span>
              </div>
              <input 
                type="file" 
                accept=".json" 
                className="hidden" 
                onChange={handleFileUpload} 
              />
            </label>

            {error && (
              <div className="flex items-start gap-3 rounded-xl border-2 border-[#ffc9c9] bg-[#fff2f2] p-4 font-bold text-danger">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {!wordsPreview.length && !error && (
              <div className="space-y-2 pt-2">
                <p className="text-sm font-bold text-muted-foreground">File mẫu nên có dạng:</p>
                <div className="rounded-xl border-2 border-night-ink bg-night-ink p-5 font-mono text-sm text-white overflow-x-auto">
                  <pre>{templateJson}</pre>
                </div>
              </div>
            )}

            {wordsPreview.length > 0 && (
              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-lg font-black text-primary">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    Đã nhận {wordsPreview.length} từ
                  </h3>
                </div>
                <div className="max-h-[300px] overflow-y-auto rounded-xl border-2 border-border bg-card">
                  <table className="se-table text-sm">
                    <thead className="sticky top-0">
                      <tr>
                        <th>Từ tiếng Anh</th>
                        <th>Nghĩa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wordsPreview.map((item, idx) => (
                        <tr key={idx} className="hover:bg-muted/60">
                          <td className="font-black text-foreground">{item.word}</td>
                          <td className="font-bold text-muted-foreground">{item.meaning}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || wordsPreview.length === 0}
            size="lg"
            className="mt-4 w-full"
          >
            {loading ? 'Đang xử lý...' : (
              <>
                <Save className="w-6 h-6" /> Lưu gói từ
              </>
            )}
          </Button>
        </form>
      </Panel>
    </div>
  );
};

export default ImportVocabulary;
