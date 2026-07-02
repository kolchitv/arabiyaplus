import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/card";
import { useBookStore, createEmptyBook } from "@/store/bookStore";
import { saveBook } from "@/services/db";
import type { BookInfo } from "@/types/book";

type FormValues = Omit<BookInfo, "coverImageId">;

export default function BookInfoPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState } = useForm<FormValues>({
    defaultValues: {
      title: "",
      author: "",
      grade: "",
      language: "ar",
      subject: "",
      unit: "",
      lesson: "",
      description: ""
    }
  });

  const onSubmit = async (values: FormValues) => {
    const book = createEmptyBook(values);
    await saveBook(book);
    useBookStore.setState({ book, activePageId: book.pages[0]?.id ?? null, isDirty: false });
    navigate(`/editor/${book.id}`);
  };

  return (
    <div className="min-h-screen bg-canvas dark:bg-ink-dark px-6 py-8 md:px-12">
      <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
        <ArrowRight size={16} /> رجوع للوحة الرئيسية
      </Button>

      <div className="mx-auto max-w-2xl">
        <h1 className="mb-1 font-display text-2xl font-extrabold text-ink dark:text-white">
          معلومات الكتاب
        </h1>
        <p className="mb-8 font-ui text-sm text-ash">
          أدخل التفاصيل الأساسية قبل بدء التصميم. يمكنك تعديلها في أي وقت.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="title">عنوان الكتاب</Label>
            <Input id="title" placeholder="مثال: القراءة العربية — الصف الثالث" {...register("title", { required: true })} />
            {formState.errors.title && (
              <p className="mt-1 text-xs text-red-600">هذا الحقل مطلوب</p>
            )}
          </div>

          <div>
            <Label htmlFor="author">المؤلف</Label>
            <Input id="author" {...register("author")} />
          </div>

          <div>
            <Label htmlFor="grade">المرحلة الدراسية</Label>
            <Input id="grade" placeholder="مثال: الصف الثالث" {...register("grade")} />
          </div>

          <div>
            <Label htmlFor="subject">المادة</Label>
            <Input id="subject" placeholder="مثال: اللغة العربية" {...register("subject")} />
          </div>

          <div>
            <Label htmlFor="language">اللغة</Label>
            <select
              id="language"
              className="h-10 w-full rounded-xl border border-ash/30 bg-white/70 dark:bg-ink-light/40 px-3 text-sm font-ui text-ink dark:text-white"
              {...register("language")}
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
          </div>

          <div>
            <Label htmlFor="unit">الوحدة</Label>
            <Input id="unit" {...register("unit")} />
          </div>

          <div>
            <Label htmlFor="lesson">الدرس</Label>
            <Input id="lesson" {...register("lesson")} />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="description">الوصف</Label>
            <Textarea id="description" rows={4} {...register("description")} />
          </div>

          <div className="sm:col-span-2 mt-2">
            <Button type="submit" size="lg" variant="accent" className="w-full">
              إنشاء الكتاب والبدء بالتصميم
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
