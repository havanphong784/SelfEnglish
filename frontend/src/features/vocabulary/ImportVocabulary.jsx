import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Save, AlertCircle } from 'lucide-react';
import { fetchWithAuth } from '../../utils/api';

const ImportVocabulary = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'All Levels'
  });
  const [wordsPreview, setWordsPreview] = useState([]);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
          title: formData.title,
          description: formData.description,
          level: formData.level
        })
      });
      
      alert(`Đã import thành công ${wordsPreview.length} từ vựng!`);
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/dashboard/vocabulary')}
          className="p-2 hover:bg-secondary rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Thêm gói từ vựng mới</h1>
          <p className="text-muted-foreground">Nhập thông tin và upload file JSON để tạo gói từ vựng của riêng bạn.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <form id="import-form" onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tên gói từ vựng</label>
              <input 
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-3 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="VD: Từ vựng IELTS Core"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mô tả chi tiết</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-3 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                placeholder="Mô tả gói từ vựng của bạn..."
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Độ khó (Level)</label>
              <select 
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                className="w-full p-3 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              >
                <option value="All Levels">Tất cả mọi trình độ</option>
                <option value="Beginner">Người mới bắt đầu</option>
                <option value="Intermediate">Trung cấp</option>
                <option value="Advanced">Nâng cao</option>
              </select>
            </div>

            <button 
              type="submit"
              disabled={loading || wordsPreview.length === 0}
              className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-pink-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Đang lưu...' : (
                <>
                  <Save className="w-5 h-5" /> Xác nhận Import
                </>
              )}
            </button>
          </form>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Dữ liệu từ vựng (JSON)</h2>
            <div className="mb-4">
              <label className="block w-full cursor-pointer bg-primary/5 hover:bg-primary/10 border-2 border-dashed border-primary/30 hover:border-primary/50 text-primary text-center py-6 rounded-xl transition-all">
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8" />
                  <span className="font-semibold text-lg">Click để tải lên file JSON</span>
                  <span className="text-sm opacity-70">hoặc kéo thả file vào đây</span>
                </div>
                <input 
                  type="file" 
                  accept=".json" 
                  className="hidden" 
                  onChange={handleFileUpload} 
                />
              </label>
            </div>

            {error && (
              <div className="p-4 mb-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {!wordsPreview.length && !error && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Cấu trúc file mẫu:</p>
                <div className="bg-[#1c1417] text-slate-300 p-4 rounded-xl text-sm font-mono overflow-x-auto border border-white/5">
                  <pre>{templateJson}</pre>
                </div>
              </div>
            )}

            {wordsPreview.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Xem trước dữ liệu ({wordsPreview.length} từ)</h3>
                </div>
                <div className="bg-secondary/30 rounded-xl overflow-hidden border border-border">
                  <div className="max-h-[400px] overflow-y-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-secondary/50 sticky top-0 backdrop-blur-md">
                        <tr>
                          <th className="p-3 font-medium">Từ vựng</th>
                          <th className="p-3 font-medium">Nghĩa</th>
                          <th className="p-3 font-medium text-muted-foreground hidden sm:table-cell">Phát âm</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {wordsPreview.map((item, idx) => (
                          <tr key={idx} className="hover:bg-secondary/30 transition-colors">
                            <td className="p-3 font-semibold text-primary">{item.word}</td>
                            <td className="p-3">{item.meaning}</td>
                            <td className="p-3 text-muted-foreground hidden sm:table-cell">{item.ipa || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

export default ImportVocabulary;
