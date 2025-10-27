"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { File as FileIcon, UploadCloud, X } from "lucide-react";
import { useState } from "react";

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContentAdded: () => void; // Callback to refresh content list
}

type ContentType = "document" | "video" | "audio" | "physical";

export function AddContentModal({
  isOpen,
  onClose,
  onContentAdded,
}: AddContentModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [contentType, setContentType] = useState<ContentType | "">("");
  const [category, setCategory] = useState("");
  const [isExclusive, setIsExclusive] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!title || !contentType || !category) {
      setError("Title, Content Type, and Category are required.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      // TODO: Implement the actual API call to upload content
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("content_type", contentType);
      formData.append("category", category);
      formData.append("is_exclusive", String(isExclusive));
      if (file) {
        formData.append("file", file);
      }

      console.log(
        "Submitting form data:",
        Object.fromEntries(formData.entries())
      );
      // await adminContentService.create(formData);

      onContentAdded(); // Refresh the list
      onClose(); // Close modal on success
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to add content.");
    } finally {
      setSubmitting(false);
    }
  };

  const onOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-bold">
            Add New Content
          </DialogTitle>
          <DialogDescription>
            Upload and configure a new item for the digital library.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 p-6 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="content-type">Content Type</Label>
                <Select
                  onValueChange={(value: ContentType) => setContentType(value)}
                  value={contentType}
                >
                  <SelectTrigger id="content-type">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="physical">Physical Item</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select onValueChange={setCategory} value={category}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exam_text">Exam Text</SelectItem>
                    <SelectItem value="cibn_publication">
                      CIBN Publication
                    </SelectItem>
                    <SelectItem value="research_paper">
                      Research Paper
                    </SelectItem>
                    <SelectItem value="stationery">Stationery</SelectItem>
                    <SelectItem value="souvenir">Souvenir</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Annual Banking Report 2024"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a brief summary of the content..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₦)</Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g., 5000"
                />
              </div>
              <div className="flex flex-col justify-end space-y-2">
                <div className="flex items-center space-x-2 p-2 rounded-md border">
                  <Switch
                    id="exclusive-mode"
                    checked={isExclusive}
                    onCheckedChange={setIsExclusive}
                  />
                  <Label htmlFor="exclusive-mode" className="cursor-pointer">
                    Exclusive to CIBN Members
                  </Label>
                </div>
              </div>
            </div>

            {contentType && contentType !== "physical" && (
              <div className="space-y-2">
                <Label>Content File</Label>
                <div
                  className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {file ? (
                    <div className="text-center">
                      <FileIcon className="mx-auto h-12 w-12 text-gray-500" />
                      <p className="mt-2 font-semibold text-gray-700">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        <span className="font-semibold text-brand-primary">
                          Click to upload
                        </span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, MP4, MP3, etc.
                      </p>
                      <input
                        id="dropzone-file"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="px-6 text-sm font-medium text-red-600">{error}</div>
          )}

          <DialogFooter className="p-6 bg-gray-50 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="w-48 text-cibn-navy-blue font-bold bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_4px_20px_-8px_rgba(255,215,0,0.6)] transition-all hover:shadow-[0_8px_30px_-10px_rgba(255,215,0,0.8)] hover:scale-[1.02] disabled:opacity-50"
            >
              {submitting ? "Uploading..." : "Add Content"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
