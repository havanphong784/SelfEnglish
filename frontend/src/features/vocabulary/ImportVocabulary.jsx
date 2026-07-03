import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, FileJson, Save, Upload } from 'lucide-react';
import { fetchWithAuth } from '../../utils/api';

const templateJson = `[
  {
    "word": "Diligent",
    "meaning": "Siêng năng, cần cù",
    "ipa": "/ˈdɪlɪdʒənt/",
    "example": "He is a diligent student."
  }
]`;

const ImportVocabulary = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [wordsPreview, setWordsPreview] = useState([]);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = async (readerEvent) => {
      try {
        const jsonData = JSON.parse(readerEvent.target.result);

        if (!Array.isArray(jsonData)) {
          setError('File JSON phải là một mảng object.');
          setWordsPreview([]);
          return;
        }

        const isValid = jsonData.every((item) => item.word && item.meaning);
        if (!isValid) {
          setError("Mỗi từ vựng cần có ít nhất trường 'word' và 'meaning'.");
          setWordsPreview([]);
          return;
        }

        setWordsPreview(jsonData);
        if (!title) {
          const cleanName = file.name.replace(/\.json$/i, '');
          setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
        }
      } catch (readError) {
        console.error('Lỗi khi đọc file:', readError);
        setError('File không đúng định dạng JSON hoặc có lỗi khi đọc.');
        setWordsPreview([]);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
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
          title,
        }),
      });

      navigate('/dashboard/vocabulary');
    } catch (submitError) {
      console.error('Lỗi khi lưu gói từ vựng:', submitError);
      setError('Có lỗi xảy ra khi lưu gói từ vựng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pt-2">
      <button
        onClick={() => navigate('/dashboard/vocabulary')}
        className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-bold text-muted-foreground pressable hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại thư viện
      </button>

      <section className="rounded-xl surface-panel p-6 md:p-8">
        <p className="mb-4 inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Import JSON
        </p>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">
          Tạo một gói từ vựng mới.
        </h1>
        <p className="mt-5 max-w-2xl text-pretty text-sm leading-7 text-muted-foreground md:text-base">
          File cần là mảng JSON. Mỗi item có ít nhất word và meaning; các trường ipa, example, partOfSpeech có thể thêm nếu có.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <div className="rounded-xl surface-flat p-5 md:p-6">
            <label className="mb-2 block text-sm font-bold text-foreground">Tên gói từ vựng</label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="min-h-12 w-full rounded-lg surface-inset px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-ring/25"
              placeholder="VD: IELTS Core"
            />
          </div>

          <div className="rounded-xl surface-flat p-5 md:p-6">
            <label className="mb-3 block text-sm font-bold text-foreground">Dữ liệu JSON</label>
            <label className="flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-primary/35 bg-primary/5 px-6 py-8 text-center text-primary pressable hover:border-primary/60 hover:bg-primary/10">
              <Upload className="mb-4 h-8 w-8" />
              <span className="text-base font-bold">Chọn file JSON</span>
              <span className="mt-2 text-sm font-medium text-muted-foreground">
                {fileName || 'Dữ liệu sẽ được kiểm tra trước khi import.'}
              </span>
              <input type="file" accept=".json" className="hidden" onChange={handleFileUpload} />
            </label>

            {error && (
              <div className="mt-5 flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || wordsPreview.length === 0}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground pressable hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Đang xử lý...' : 'Xác nhận import'}
          </button>
        </div>

        <div className="rounded-xl surface-flat p-5 md:p-6">
          {wordsPreview.length > 0 ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Preview</p>
                  <h2 className="mt-1 text-xl font-bold text-foreground">Đã tải {wordsPreview.length} từ</h2>
                </div>
                <span className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                  <FileJson className="h-3.5 w-3.5" />
                  JSON hợp lệ
                </span>
              </div>

              <div className="max-h-[470px] overflow-auto rounded-lg border border-border">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead className="sticky top-0 bg-muted">
                    <tr>
                      <th className="p-4 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Từ vựng</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Nghĩa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wordsPreview.map((item, index) => (
                      <tr key={`${item.word}-${index}`} className="border-t border-border bg-card hover:bg-muted/30">
                        <td className="p-4 font-bold text-foreground">{item.word}</td>
                        <td className="p-4 leading-6 text-muted-foreground">{item.meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Mẫu file</p>
                <h2 className="mt-1 text-xl font-bold text-foreground">Cấu trúc tối thiểu</h2>
              </div>
              <pre className="overflow-x-auto rounded-lg border border-border bg-[#1f2421] p-5 font-mono text-sm leading-7 text-[#e9eee7]">
                {templateJson}
              </pre>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default ImportVocabulary;
