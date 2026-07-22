// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    interface Error {
      message: string
      requestId?: string
    }

    interface Locals {
      preview: boolean
      requestId: string
    }

    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {}
