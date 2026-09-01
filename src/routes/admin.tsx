import { createFileRoute, useNavigate, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { getCurrentAdmin } from "@/lib/auth.functions";
import { getStoredToken, clearStoredToken } from "@/lib/auth-client";
import { uploadMedia, removeMedia } from "@/lib/storage";
import { categories, formatKES, type Product } from "@/lib/products";
import { adminListProducts, createProduct, updateProduct, deleteProduct } from "@/lib/products.functions";
import {
  adminListGalleryImages,
  createGalleryImage,
  deleteGalleryImage,
  type GalleryImage,
} from "@/lib/gallery.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Pencil, LogOut, ImageIcon, X } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — Aquatace" }, { name: "robots", content: "noindex" }],
  }),
  errorComponent: ({ error, reset }) => (
    <div className="container-page py-24 text-center">
      <p className="text-sm text-destructive">{error?.message ?? "Something went wrong"}</p>
      <button onClick={reset} className="mt-4 text-sm underline">Try again</button>
    </div>
  ),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState<boolean | undefined>(undefined);
  const routerState = useRouterState();
  const isLoginPage = routerState.location.pathname === '/admin/login';

  useEffect(() => {
    if (!getStoredToken()) {
      setAuthed(false);
      return;
    }
    getCurrentAdmin()
      .then((admin) => setAuthed(!!admin))
      .catch(() => setAuthed(false));
  }, []);

  useEffect(() => {
    if (authed === false && !isLoginPage) navigate({ to: "/admin/login" });
  }, [authed, navigate, isLoginPage]);

  if (isLoginPage) return <Outlet />;

  if (authed === undefined) {
    return <div className="container-page py-24 text-center text-muted-foreground">Loading…</div>;
  }
  if (!authed) return null;

  function signOut() {
    clearStoredToken();
    navigate({ to: "/admin/login" });
  }

  return (
    <div className="container-page py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Admin</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Manage catalog</h1>
        </div>
        <Button variant="outline" className="rounded-full" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </div>

      <Tabs defaultValue="products" className="mt-8">
        <TabsList className="rounded-full">
          <TabsTrigger value="products" className="rounded-full">Products</TabsTrigger>
          <TabsTrigger value="gallery" className="rounded-full">Gallery</TabsTrigger>
        </TabsList>
        <TabsContent value="products" className="mt-6">
          <ProductsPanel />
        </TabsContent>
        <TabsContent value="gallery" className="mt-6">
          <GalleryPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

const PAGE_SIZE = 10;

function ProductsPanel() {
  const queryClient = useQueryClient();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => adminListProducts(),
    retry: 2,
  });
  const [editing, setEditing] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const paginated = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
    // The public gallery includes every in-stock product's photo, so a
    // product image edit needs to bust that cache too.
    queryClient.invalidateQueries({ queryKey: ["gallery"] });
  }

  const deleteMutation = useMutation({
    mutationFn: async (product: Product) => {
      const { imagePath } = await deleteProduct({ data: { id: product.id } });
      await removeMedia(imagePath);
    },
    onSuccess: () => { toast.success("Product deleted"); invalidate(); },
    onError: (e: Error) => toast.error("Delete failed", { description: e.message }),
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{products.length} product{products.length !== 1 ? "s" : ""}</p>
        <Button className="rounded-full" onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add product
        </Button>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">Loading…</TableCell>
              </TableRow>
            )}
            {!isLoading && paginated.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg border border-border object-contain p-0.5" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <span className="font-medium">{p.name}</span>
                  </div>
                </TableCell>
                <TableCell className="capitalize">{p.category}</TableCell>
                <TableCell>{formatKES(p.price)}</TableCell>
                <TableCell>
                  {p.active ? <Badge>Active</Badge> : <Badge variant="secondary">Hidden</Badge>}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(p); setFormOpen(true); }} aria-label={`Edit ${p.name}`}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label={`Delete ${p.name}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete "{p.name}"?</AlertDialogTitle>
                        <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMutation.mutate(p)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && products.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No products yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-muted-foreground">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-full" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" className="rounded-full" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editing} onSaved={invalidate} />
    </div>
  );
}

const ProductFormSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Required")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
  name: z.string().trim().min(1, "Required"),
  category: z.enum(["water", "gas", "electronics"]),
  brand: z.string().trim().min(1, "Required"),
  price: z.coerce.number().positive("Must be greater than 0"),
  size: z.string().trim().optional(),
  productType: z.string().trim().optional(),
  description: z.string().trim().optional(),
  badge: z.string().trim().optional(),
  featured: z.boolean(),
  active: z.boolean(),
  sortOrder: z.coerce.number().int(),
  specs: z.array(z.object({ label: z.string().trim().min(1), value: z.string().trim().min(1) })),
});

function ProductFormDialog({
  open, onOpenChange, product, onSaved,
}: { open: boolean; onOpenChange: (v: boolean) => void; product: Product | null; onSaved: () => void }) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const form = useForm<z.infer<typeof ProductFormSchema>>({
    resolver: zodResolver(ProductFormSchema),
    values: {
      slug: product?.slug ?? "",
      name: product?.name ?? "",
      category: product?.category ?? "water",
      brand: product?.brand ?? "",
      price: product?.price ?? 0,
      size: product?.size ?? "",
      productType: product?.productType ?? "",
      description: product?.description ?? "",
      badge: product?.badge ?? "",
      featured: product?.featured ?? false,
      active: product?.active ?? true,
      sortOrder: product?.sortOrder ?? 0,
      specs: product?.specs ?? [],
    },
  });
  const specs = useFieldArray({ control: form.control, name: "specs" });

  useEffect(() => {
    if (open) setImageFile(null);
  }, [open, product]);

  async function onSubmit(values: z.infer<typeof ProductFormSchema>) {
    setSaving(true);
    try {
      let imageUrl = product?.image;
      let imagePath = product?.imagePath;
      if (imageFile) {
        const uploaded = await uploadMedia(imageFile, "products");
        imageUrl = uploaded.url;
        imagePath = uploaded.path;
        if (product?.imagePath) await removeMedia(product.imagePath);
      }
      const payload = { ...values, imageUrl: imageUrl || "", imagePath: imagePath || "" };
      if (product) {
        await updateProduct({ data: { id: product.id, product: payload } });
        toast.success("Product updated");
      } else {
        await createProduct({ data: payload });
        toast.success("Product added");
      }
      onSaved();
      onOpenChange(false);
    } catch (e) {
      toast.error("Save failed", { description: e instanceof Error ? e.message : String(e) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit product" : "Add product"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="slug" render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug (URL)</FormLabel>
                  <FormControl><Input {...field} placeholder="20l-water-refill" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="brand" render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (KES)</FormLabel>
                  <FormControl><Input type="number" step="1" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="size" render={({ field }) => (
                <FormItem>
                  <FormLabel>Size</FormLabel>
                  <FormControl><Input {...field} placeholder="6kg, 20L…" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="productType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Product type (electronics)</FormLabel>
                  <FormControl><Input {...field} placeholder="Earbuds, Charger…" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="badge" render={({ field }) => (
                <FormItem>
                  <FormLabel>Badge</FormLabel>
                  <FormControl><Input {...field} placeholder="Best seller…" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div>
              <Label>Specifications</Label>
              <div className="mt-2 grid gap-2">
                {specs.fields.map((f, i) => (
                  <div key={f.id} className="flex items-center gap-2">
                    <Input
                      placeholder="Label"
                      {...form.register(`specs.${i}.label` as const)}
                      className="w-1/2"
                    />
                    <Input
                      placeholder="Value"
                      {...form.register(`specs.${i}.value` as const)}
                      className="w-1/2"
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => specs.remove(i)} aria-label="Remove spec">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button" variant="outline" size="sm" className="mt-2 rounded-full"
                onClick={() => specs.append({ label: "", value: "" })}
              >
                <Plus className="mr-1 h-3 w-3" /> Add spec
              </Button>
            </div>

            <div className="grid gap-2">
              <Label>Photo</Label>
              {(imageFile || product?.image) && (
                <div className="flex items-center gap-3">
                  <img
                    src={imageFile ? URL.createObjectURL(imageFile) : product?.image}
                    alt="Product preview"
                    className="h-24 w-24 rounded-xl border border-border object-contain p-2"
                  />
                  {!imageFile && product?.image && (
                    <p className="text-xs text-muted-foreground">Current image. Upload a new one to replace it.</p>
                  )}
                </div>
              )}
              <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField control={form.control} name="featured" render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-2 rounded-xl border border-border p-3">
                  <FormLabel className="!mt-0">Featured</FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="active" render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-2 rounded-xl border border-border p-3">
                  <FormLabel className="!mt-0">Visible</FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="sortOrder" render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort order</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                </FormItem>
              )} />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={saving} className="rounded-full">
                {saving ? "Saving…" : product ? "Save changes" : "Add product"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function GalleryPanel() {
  const queryClient = useQueryClient();
  const { data: images = [], isLoading } = useQuery({
    queryKey: ["admin-gallery"],
    queryFn: () => adminListGalleryImages(),
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
    queryClient.invalidateQueries({ queryKey: ["gallery"] });
  }

  const deleteMutation = useMutation({
    mutationFn: async (image: GalleryImage) => {
      await deleteGalleryImage({ data: { id: image.id } });
      await removeMedia(image.imagePath);
    },
    onSuccess: () => { toast.success("Photo deleted"); invalidate(); },
    onError: (e: Error) => toast.error("Delete failed", { description: e.message }),
  });

  return (
    <div>
      <div className="flex justify-end">
        <Button className="rounded-full" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add photo
        </Button>
      </div>

      {!isLoading && images.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border p-10 text-center">
          <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No photos uploaded yet.</p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-square overflow-hidden rounded-2xl border border-border">
              <img src={img.imageUrl} alt={img.altText} className="h-full w-full object-cover" />
              <Button
                variant="destructive" size="icon"
                className="absolute right-2 top-2 h-7 w-7 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => deleteMutation.mutate(img)}
                aria-label="Delete photo"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <GalleryUploadDialog open={dialogOpen} onOpenChange={setDialogOpen} onSaved={invalidate} />
    </div>
  );
}

function GalleryUploadDialog({
  open, onOpenChange, onSaved,
}: { open: boolean; onOpenChange: (v: boolean) => void; onSaved: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) { setFile(null); setAltText(""); }
  }, [open]);

  async function handleSave() {
    if (!file) {
      toast.error("Choose a photo first");
      return;
    }
    setSaving(true);
    try {
      const uploaded = await uploadMedia(file, "gallery");
      await createGalleryImage({
        data: { imageUrl: uploaded.url, imagePath: uploaded.path, altText, sortOrder: 0 },
      });
      toast.success("Photo added");
      onSaved();
      onOpenChange(false);
    } catch (e) {
      toast.error("Upload failed", { description: e instanceof Error ? e.message : String(e) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add photo</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          {file && (
            <img src={URL.createObjectURL(file)} alt="Preview" className="h-40 w-full rounded-xl object-cover" />
          )}
          <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <Input
            placeholder="Alt text (describes the photo)"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={saving} className="rounded-full">
            {saving ? "Uploading…" : "Add photo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
