# typed: false
# frozen_string_literal: true

# Esfera CLI: convert spatial audio masters to IAMF / Eclipsa from the terminal.
# Installs the published npm package on top of Homebrew's node. Kept up to date
# by .github/workflows/bump.yml; do not edit the version or sha256 by hand.
class Esfera < Formula
  desc "Convert spatial audio masters to IAMF / Eclipsa on the Esfera Converter API"
  homepage "https://developers.esfera.audio"
  url "https://registry.npmjs.org/@esfera/cli/-/cli-0.3.1.tgz"
  sha256 "ac10d446600b17a4923d74b6e34538ce9352ebed67912bf9ac60d32e28c8cfed"
  license "Apache-2.0"

  depends_on "node"

  def install
    system "npm", "install", *std_npm_args
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    assert_match version.to_s, shell_output("#{bin}/esfera --version")
  end
end
