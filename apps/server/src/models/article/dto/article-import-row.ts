export interface ArticleImportRow {
  code: string;
  name?: string;
  artNumber?: string;
  type?: string;
  unit?: string;
  price?: string;
  netto?: string;
  pe?: string;
}

export interface CsvColumnMapping {
  csvHeader: string;
  articleField: keyof ArticleImportRow | null;
}

export interface ImportPreviewResponse {
  articleCount: number;
  newArticle: ArticleImportRow[];
  updateableArticle: ArticleImportRow[];
}

export interface ImportExecuteResponse {
  succeeded: number;
  failed: number;
  failedCodes: string[];
}
