#include <napi.h>

typedef struct TSLanguage TSLanguage;

extern "C" {
  TSLanguage* tree_sitter_ipython();
}

namespace {

Napi::Value GetLanguage(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  return Napi::External<TSLanguage>::New(env, tree_sitter_ipython());
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports["language"] = Napi::Function::New(env, GetLanguage);
  return exports;
}

}  // namespace

NODE_API_MODULE(tree_sitter_ipython_binding, Init)
