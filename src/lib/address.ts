export type AddressDTO = {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
};

type RawAddress = {
  _id?: unknown;
  label?: string;
  recipient?: string;
  phone?: string;
  street?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  isDefault?: boolean;
};

/** Ubah subdokumen Mongoose jadi objek biasa yang aman dikirim ke client. */
export function serializeAddresses(list: unknown): AddressDTO[] {
  return ((list ?? []) as RawAddress[]).map((a) => ({
    id: String(a._id),
    label: a.label ?? "Rumah",
    recipient: a.recipient ?? "",
    phone: a.phone ?? "",
    street: a.street ?? "",
    city: a.city ?? "",
    province: a.province ?? "",
    postalCode: a.postalCode ?? "",
    isDefault: Boolean(a.isDefault),
  }));
}
