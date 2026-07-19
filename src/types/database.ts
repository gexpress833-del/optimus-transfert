export type Currency = "USD" | "CDF";

export type UserRole = "merchant" | "admin";

export type WithdrawalStatus = "pending" | "approved" | "rejected" | "paid";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "success"
  | "failed"
  | "cancelled"
  | "expired";

export type WalletTransactionType =
  | "payment_in"
  | "commission_out"
  | "withdrawal_out"
  | "refund_out"
  | "adjustment";

export type PaymentLinkStatus = "active" | "expired" | "paid" | "cancelled";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: UserRole;
          avatar_url: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      businesses: {
        Row: {
          id: string;
          merchant_id: string;
          name: string;
          logo_url: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          city: string | null;
          country: string;
          default_currency: Currency;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          merchant_id: string;
          name: string;
          logo_url?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          country?: string;
          default_currency?: Currency;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          merchant_id?: string;
          name?: string;
          logo_url?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          country?: string;
          default_currency?: Currency;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "businesses_merchant_id_fkey";
            columns: ["merchant_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      wallets: {
        Row: {
          id: string;
          merchant_id: string;
          currency: Currency;
          available: number;
          pending: number;
          total_received: number;
          total_withdrawn: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          merchant_id: string;
          currency: Currency;
          available?: number;
          pending?: number;
          total_received?: number;
          total_withdrawn?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          merchant_id?: string;
          currency?: Currency;
          available?: number;
          pending?: number;
          total_received?: number;
          total_withdrawn?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wallets_merchant_id_fkey";
            columns: ["merchant_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      wallet_transactions: {
        Row: {
          id: string;
          wallet_id: string;
          type: WalletTransactionType;
          amount: number;
          currency: Currency;
          reference: string | null;
          description: string | null;
          payment_id: string | null;
          withdrawal_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          wallet_id: string;
          type: WalletTransactionType;
          amount: number;
          currency: Currency;
          reference?: string | null;
          description?: string | null;
          payment_id?: string | null;
          withdrawal_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          wallet_id?: string;
          type?: WalletTransactionType;
          amount?: number;
          currency?: Currency;
          reference?: string | null;
          description?: string | null;
          payment_id?: string | null;
          withdrawal_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey";
            columns: ["wallet_id"];
            isOneToOne: false;
            referencedRelation: "wallets";
            referencedColumns: ["id"];
          }
        ];
      };

      payment_links: {
        Row: {
          id: string;
          merchant_id: string;
          business_id: string;
          customer_id: string | null;
          reference: string;
          description: string;
          amount: number;
          currency: Currency;
          status: PaymentLinkStatus;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          merchant_id: string;
          business_id: string;
          customer_id?: string | null;
          reference?: string;
          description: string;
          amount: number;
          currency: Currency;
          status?: PaymentLinkStatus;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          merchant_id?: string;
          business_id?: string;
          customer_id?: string | null;
          reference?: string;
          description?: string;
          amount?: number;
          currency?: Currency;
          status?: PaymentLinkStatus;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payment_links_merchant_id_fkey";
            columns: ["merchant_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payment_links_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          }
        ];
      };

      payments: {
        Row: {
          id: string;
          payment_link_id: string;
          merchant_id: string;
          customer_id: string | null;
          amount: number;
          currency: Currency;
          commission_amount: number;
          commission_rate: number;
          status: PaymentStatus;
          provider: string;
          provider_reference: string | null;
          provider_transaction_id: string | null;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          payment_link_id: string;
          merchant_id: string;
          customer_id?: string | null;
          amount: number;
          currency: Currency;
          commission_amount?: number;
          commission_rate?: number;
          status?: PaymentStatus;
          provider?: string;
          provider_reference?: string | null;
          provider_transaction_id?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          payment_link_id?: string;
          merchant_id?: string;
          customer_id?: string | null;
          amount?: number;
          currency?: Currency;
          commission_amount?: number;
          commission_rate?: number;
          status?: PaymentStatus;
          provider?: string;
          provider_reference?: string | null;
          provider_transaction_id?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_payment_link_id_fkey";
            columns: ["payment_link_id"];
            isOneToOne: false;
            referencedRelation: "payment_links";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_merchant_id_fkey";
            columns: ["merchant_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      customers: {
        Row: {
          id: string;
          merchant_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          merchant_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          merchant_id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "customers_merchant_id_fkey";
            columns: ["merchant_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      withdrawals: {
        Row: {
          id: string;
          merchant_id: string;
          wallet_id: string;
          amount: number;
          currency: Currency;
          status: WithdrawalStatus;
          reference: string | null;
          processed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          merchant_id: string;
          wallet_id: string;
          amount: number;
          currency: Currency;
          status?: WithdrawalStatus;
          reference?: string | null;
          processed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          merchant_id?: string;
          wallet_id?: string;
          amount?: number;
          currency?: Currency;
          status?: WithdrawalStatus;
          reference?: string | null;
          processed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "withdrawals_merchant_id_fkey";
            columns: ["merchant_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "withdrawals_wallet_id_fkey";
            columns: ["wallet_id"];
            isOneToOne: false;
            referencedRelation: "wallets";
            referencedColumns: ["id"];
          }
        ];
      };

      withdrawal_accounts: {
        Row: {
          id: string;
          merchant_id: string;
          bank_name: string;
          account_number: string;
          account_holder: string;
          swift_code: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          merchant_id: string;
          bank_name: string;
          account_number: string;
          account_holder: string;
          swift_code?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          merchant_id?: string;
          bank_name?: string;
          account_number?: string;
          account_holder?: string;
          swift_code?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "withdrawal_accounts_merchant_id_fkey";
            columns: ["merchant_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      commissions: {
        Row: {
          id: string;
          payment_id: string;
          amount: number;
          currency: Currency;
          rate: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          payment_id: string;
          amount: number;
          currency: Currency;
          rate: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          payment_id?: string;
          amount?: number;
          currency?: Currency;
          rate?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "commissions_payment_id_fkey";
            columns: ["payment_id"];
            isOneToOne: false;
            referencedRelation: "payments";
            referencedColumns: ["id"];
          }
        ];
      };

      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          read?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      settings: {
        Row: {
          id: string;
          key: string;
          value: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Record<string, unknown> | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Record<string, unknown> | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          metadata?: Record<string, unknown> | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      [_ in never]: never;
    };

    Enums: {
      currency: "USD" | "CDF";
      user_role: "merchant" | "admin";
      withdrawal_status: "pending" | "approved" | "rejected" | "paid";
      payment_status:
        | "pending"
        | "processing"
        | "success"
        | "failed"
        | "cancelled"
        | "expired";
      wallet_transaction_type:
        | "payment_in"
        | "commission_out"
        | "withdrawal_out"
        | "refund_out"
        | "adjustment";
      payment_link_status: "active" | "expired" | "paid" | "cancelled";
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
