import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Save, AlertCircle } from 'lucide-react';
import { fetchWithAuth } from '../../utils/api';

const ImportVocabulary = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [wordsPreview, setWordsPreview] = useState([]);
  const [error, setError] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        
        if (!Array.isArray(jsonData)) {
          setError("File JSON phải là một mảng các object (Array of objects).");
          setWordsPreview([]);
          return;
        }

        const isValid = jsonData.every(item => item.word && item.meaning);
        if (!isValid) {
          setError("Mỗi từ vựng phải có ít nhất trường 'word' và 'meaning'.");
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
        setError('File không đúng định dạng JSON hoặc có lỗi xảy ra.');
        setWordsPreview([]);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (wordsPreview.length === 0) {
      setError('Vui lòng upload file JSON chứa danh sách từ vựng.');
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
      setError('Có lỗi xảy ra khi lưu gói từ vựng. Vui lòng thử lại sau.');
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
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/dashboard/vocabulary')}
          className="p-2 hover:bg-secondary rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Import từ vựng</h1>
          <p className="text-muted-foreground">Tạo gói từ vựng mới nhanh chóng từ file JSON.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div>
            <label className="block text-sm font-semibold mb-2">Tên gói từ vựng</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-4 bg-secondary/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-lg"
              placeholder="VD: Từ vựng IELTS Core"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold mb-2">Dữ liệu JSON</label>
            <label className="block w-full cursor-pointer bg-primary/5 hover:bg-primary/10 border-2 border-dashed border-primary/30 hover:border-primary/50 text-primary text-center py-10 rounded-2xl transition-all">
              <div className="flex flex-col items-center gap-3">
                <Upload className="w-10 h-10 mb-1" />
                <span className="font-bold text-lg">Click để tải lên file JSON</span>
                <span className="text-sm opacity-70">Hoặc kéo thả file vào khung này</span>
              </div>
              <input 
                type="file" 
                accept=".json" 
                className="hidden" 
                onChange={handleFileUpload} 
              />
            </label>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {!wordsPreview.length && !error && (
              <div className="space-y-2 pt-2">
                <p className="text-sm text-muted-foreground font-medium">Cấu trúc file mẫu:</p>
                <div className="bg-[#1c1417] text-slate-300 p-5 rounded-2xl text-sm font-mono overflow-x-auto border border-white/5">
                  <pre>{templateJson}</pre>
                </div>
              </div>
            )}

            {wordsPreview.length > 0 && (
              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-emerald-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    Đã tải {wordsPreview.length} từ vựng
                  </h3>
                </div>
                <div className="bg-secondary/30 rounded-2xl overflow-hidden border border-border max-h-[300px] overflow-y-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-secondary/50 sticky top-0 backdrop-blur-md">
                      <tr>
                        <th className="p-4 font-semibold text-muted-foreground">Từ vựng</th>
                        <th className="p-4 font-semibold text-muted-foreground">Nghĩa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {wordsPreview.map((item, idx) => (
                        <tr key={idx} className="hover:bg-secondary/50 transition-colors">
                          <td className="p-4 font-bold text-foreground text-base">{item.word}</td>
                          <td className="p-4 text-muted-foreground">{item.meaning}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <button 
            type="submit"
            disabled={loading || wordsPreview.length === 0}
            className="w-full py-4 mt-4 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-bold text-lg rounded-2xl transition-all shadow-lg shadow-pink-500/20 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? 'Đang xử lý...' : (
              <>
                <Save className="w-6 h-6" /> Xác nhận Import
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ImportVocabulary;
