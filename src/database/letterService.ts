import { supabase, toCamel, toSnake } from "./supabaseClient";
import { Letter, LetterTemplate, LetterType } from "../types";

export const letterService = {
  // Letter management
  getAllLetters: async () => {
    const { data, error } = await supabase
      .from("letters")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return toCamel(data) || [];
  },

  getLetterById: async (id: number) => {
    const { data, error } = await supabase
      .from("letters")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return undefined;
    return toCamel(data);
  },

  getLettersByResident: async (residentId: number) => {
    const { data, error } = await supabase
      .from("letters")
      .select("*")
      .eq("resident_id", residentId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return toCamel(data) || [];
  },

  searchLetters: async (query: string) => {
    const { data, error } = await supabase
      .from("letters")
      .select("*")
      .or(`title.ilike.%${query}%,letter_number.ilike.%${query}%`)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return toCamel(data) || [];
  },

  generateLetterNumber: async (letterType: LetterType) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // Get count of letters of this type in the current year
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const { count, error } = await supabase
      .from("letters")
      .select("*", { count: "exact", head: true })
      .eq("letter_type", letterType)
      .gte("issued_date", startDate)
      .lte("issued_date", endDate);

    if (error) throw error;

    const actualCount = count || 0;

    // Generate letter number format: 001/LTR-TYPE/MONTH/YEAR
    const typeCode = getLetterTypeCode(letterType);
    const formattedCount = String(actualCount + 1).padStart(3, "0");
    const formattedMonth = String(month).padStart(2, "0");

    return `${formattedCount}/${typeCode}/${formattedMonth}/${year}`;
  },

  addLetter: async function (letter: Letter) {
    if (!letter.letterNumber) {
      letter.letterNumber = await letterService.generateLetterNumber(
        letter.letterType
      );
    }
    const now = new Date().toISOString();
    
    // Format issuedDate appropriately as string YYYY-MM-DD
    let issuedDateStr = "";
    if (letter.issuedDate) {
      const d = new Date(letter.issuedDate);
      issuedDateStr = !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
    } else {
      issuedDateStr = new Date().toISOString().slice(0, 10);
    }

    const letterSnake = toSnake({
      ...letter,
      issuedDate: issuedDateStr,
      createdAt: now,
      updatedAt: now,
    });
    delete letterSnake.id;

    const { data, error } = await supabase
      .from("letters")
      .insert(letterSnake)
      .select()
      .single();
    if (error) throw error;
    return toCamel(data).id;
  },

  updateLetter: async (id: number, letter: Partial<Letter>) => {
    const now = new Date().toISOString();
    
    const updatePayload: any = {
      ...letter,
      updatedAt: now
    };

    if (letter.issuedDate) {
      const d = new Date(letter.issuedDate);
      updatePayload.issuedDate = !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : undefined;
    }

    const letterSnake = toSnake(updatePayload);
    delete letterSnake.id;

    const { data, error } = await supabase
      .from("letters")
      .update(letterSnake)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return toCamel(data);
  },

  deleteLetter: async (id: number) => {
    const { error } = await supabase.from("letters").delete().eq("id", id);
    if (error) throw error;
    return true;
  },

  // Letter templates
  getAllTemplates: async () => {
    const { data, error } = await supabase
      .from("letter_templates")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return toCamel(data) || [];
  },

  getTemplatesByType: async (type: LetterType) => {
    const { data, error } = await supabase
      .from("letter_templates")
      .select("*")
      .eq("type", type)
      .order("name", { ascending: true });
    if (error) throw error;
    return toCamel(data) || [];
  },

  getDefaultTemplateByType: async (type: LetterType) => {
    const { data, error } = await supabase
      .from("letter_templates")
      .select("*")
      .eq("type", type)
      .eq("is_default", true)
      .maybeSingle();
    if (error) return undefined;
    return toCamel(data);
  },

  addTemplate: async (template: LetterTemplate) => {
    if (template.isDefault) {
      await supabase
        .from("letter_templates")
        .update({ is_default: false })
        .eq("type", template.type)
        .eq("is_default", true);
    }

    const now = new Date().toISOString();
    const templateSnake = toSnake({
      ...template,
      createdAt: now,
      updatedAt: now,
    });
    delete templateSnake.id;

    const { data, error } = await supabase
      .from("letter_templates")
      .insert(templateSnake)
      .select()
      .single();
    if (error) throw error;
    return toCamel(data).id;
  },

  updateTemplate: async (id: number, template: Partial<LetterTemplate>) => {
    if (template.isDefault) {
      const currentTemplate = await letterService.getTemplateById(id);
      if (currentTemplate) {
        await supabase
          .from("letter_templates")
          .update({ is_default: false })
          .eq("type", currentTemplate.type)
          .eq("is_default", true)
          .neq("id", id);
      }
    }

    const now = new Date().toISOString();
    const templateSnake = toSnake({
      ...template,
      updatedAt: now,
    });
    delete templateSnake.id;

    const { data, error } = await supabase
      .from("letter_templates")
      .update(templateSnake)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return toCamel(data);
  },

  getTemplateById: async (id: number) => {
    const { data, error } = await supabase
      .from("letter_templates")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return undefined;
    return toCamel(data);
  },

  deleteTemplate: async (id: number) => {
    const template = await letterService.getTemplateById(id);

    if (template) {
      const { count, error: countError } = await supabase
        .from("letter_templates")
        .select("*", { count: "exact", head: true })
        .eq("type", template.type);

      if (countError) throw countError;

      const totalCount = count || 0;
      if (totalCount <= 1) {
        throw new Error(
          "Tidak dapat menghapus template terakhir untuk jenis surat ini"
        );
      }

      if (template.isDefault) {
        const { data: anotherTemplate, error: findError } = await supabase
          .from("letter_templates")
          .select("id")
          .eq("type", template.type)
          .neq("id", id)
          .limit(1)
          .maybeSingle();

        if (findError) throw findError;

        if (anotherTemplate) {
          await supabase
            .from("letter_templates")
            .update({ is_default: true })
            .eq("id", anotherTemplate.id);
        }
      }
    }

    const { error } = await supabase
      .from("letter_templates")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return true;
  },
};

// Helper function to get letter type code
function getLetterTypeCode(type: LetterType): string {
  switch (type) {
    case "domicile":
      return "KET-DOM";
    case "poverty":
      return "KET-TDK-MAMPU";
    case "introduction":
      return "PENGANTAR";
    case "business":
      return "KET-USAHA";
    case "birth":
      return "KET-LAHIR";
    case "keramaian":
      return "KERAMAIAN";
    case "custom":
      return "CUSTOM";
    case "wali-nikah":
      return "WN";
    case "pengantar-numpang-nikah":
      return "PNN";
    default:
      return "SURAT";
  }
}