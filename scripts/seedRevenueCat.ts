import { getUncachableRevenueCatClient } from "./revenueCatClient";

import {
  listProjects,
  createProject,
  listApps,
  createApp,
  listAppPublicApiKeys,
  listProducts,
  createProduct,
  listEntitlements,
  createEntitlement,
  attachProductsToEntitlement,
  listOfferings,
  createOffering,
  updateOffering,
  listPackages,
  createPackages,
  attachProductsToPackage,
  type App,
  type Product,
  type Project,
  type Entitlement,
  type Offering,
  type Package,
  type CreateProductData,
} from "replit-revenuecat-v2";

const PROJECT_NAME = "Flip One";

// One-time purchase: Remove Ads
const PRODUCT_REMOVE_ADS_ID = "com.flipone.remove_ads";
const PRODUCT_REMOVE_ADS_DISPLAY_NAME = "Remove Ads";
const PRODUCT_REMOVE_ADS_TITLE = "Remove Ads";

// One-time purchase: Starter Pack (500 points)
const PRODUCT_STARTER_PACK_ID = "com.flipone.starter_pack";
const PRODUCT_STARTER_PACK_DISPLAY_NAME = "Starter Pack";
const PRODUCT_STARTER_PACK_TITLE = "Starter Pack (500 points)";

// One-time purchase: Mega Pack (1500 points)
const PRODUCT_MEGA_PACK_ID = "com.flipone.mega_pack";
const PRODUCT_MEGA_PACK_DISPLAY_NAME = "Mega Pack";
const PRODUCT_MEGA_PACK_TITLE = "Mega Pack (1500 points)";

const APP_STORE_APP_NAME = "Flip One iOS";
const APP_STORE_BUNDLE_ID = "com.hhdapps.flipone";
const PLAY_STORE_APP_NAME = "Flip One Android";
const PLAY_STORE_PACKAGE_NAME = "com.hhdapps.flipone";

const ENTITLEMENT_NO_ADS_ID = "no_ads";
const ENTITLEMENT_NO_ADS_DISPLAY = "No Ads";

const OFFERING_IDENTIFIER = "default";
const OFFERING_DISPLAY_NAME = "Default Offering";

const PKG_REMOVE_ADS = "$rc_lifetime";
const PKG_REMOVE_ADS_DISPLAY = "Remove Ads";

const PKG_STARTER = "starter_pack";
const PKG_STARTER_DISPLAY = "Starter Pack";

const PKG_MEGA = "mega_pack";
const PKG_MEGA_DISPLAY = "Mega Pack";

type TestStorePricesResponse = {
  object: string;
  prices: { amount_micros: number; currency: string }[];
};

async function seedRevenueCat() {
  const client = await getUncachableRevenueCatClient();

  // ── Project ──────────────────────────────────────────────────────────────
  let project: Project;
  const { data: existingProjects, error: listProjectsError } = await listProjects({
    client,
    query: { limit: 20 },
  });
  if (listProjectsError) throw new Error("Failed to list projects");

  const existingProject = existingProjects.items?.find((p) => p.name === PROJECT_NAME);
  if (existingProject) {
    console.log("Project already exists:", existingProject.id);
    project = existingProject;
  } else {
    const { data: newProject, error } = await createProject({ client, body: { name: PROJECT_NAME } });
    if (error) throw new Error("Failed to create project");
    console.log("Created project:", newProject.id);
    project = newProject;
  }

  // ── Apps ─────────────────────────────────────────────────────────────────
  const { data: apps, error: listAppsError } = await listApps({
    client,
    path: { project_id: project.id },
    query: { limit: 20 },
  });
  if (listAppsError || !apps || apps.items.length === 0) throw new Error("No apps found");

  let testApp: App | undefined = apps.items.find((a) => a.type === "test_store");
  let appStoreApp: App | undefined = apps.items.find((a) => a.type === "app_store");
  let playStoreApp: App | undefined = apps.items.find((a) => a.type === "play_store");

  if (!testApp) throw new Error("No test store app found");
  console.log("Test store app:", testApp.id);

  if (!appStoreApp) {
    const { data: newApp, error } = await createApp({
      client,
      path: { project_id: project.id },
      body: { name: APP_STORE_APP_NAME, type: "app_store", app_store: { bundle_id: APP_STORE_BUNDLE_ID } },
    });
    if (error) throw new Error("Failed to create App Store app");
    appStoreApp = newApp;
    console.log("Created App Store app:", appStoreApp.id);
  } else {
    console.log("App Store app:", appStoreApp.id);
  }

  if (!playStoreApp) {
    const { data: newApp, error } = await createApp({
      client,
      path: { project_id: project.id },
      body: { name: PLAY_STORE_APP_NAME, type: "play_store", play_store: { package_name: PLAY_STORE_PACKAGE_NAME } },
    });
    if (error) throw new Error("Failed to create Play Store app");
    playStoreApp = newApp;
    console.log("Created Play Store app:", playStoreApp.id);
  } else {
    console.log("Play Store app:", playStoreApp.id);
  }

  // ── Products ─────────────────────────────────────────────────────────────
  const { data: existingProducts, error: listProductsError } = await listProducts({
    client,
    path: { project_id: project.id },
    query: { limit: 100 },
  });
  if (listProductsError) throw new Error("Failed to list products");

  type ProductDef = {
    storeId: string;
    playStoreId: string;
    displayName: string;
    title: string;
    prices: { amount_micros: number; currency: string }[];
  };

  const ensureProduct = async (targetApp: App, label: string, def: ProductDef, isTestStore: boolean): Promise<Product> => {
    const productId = isTestStore || targetApp.type === "app_store" ? def.storeId : def.playStoreId;
    const existing = existingProducts.items?.find(
      (p) => p.store_identifier === productId && p.app_id === targetApp.id
    );
    if (existing) {
      console.log(`${label} product already exists:`, existing.id);
      return existing;
    }
    const body: CreateProductData["body"] = {
      store_identifier: productId,
      app_id: targetApp.id,
      type: isTestStore ? "non_consumable" : "one_time",
      display_name: def.displayName,
    };
    if (isTestStore) {
      body.title = def.title;
    }
    const { data: created, error } = await createProduct({
      client,
      path: { project_id: project.id },
      body,
    });
    if (error) throw new Error(`Failed to create ${label} product: ${JSON.stringify(error)}`);
    console.log(`Created ${label} product:`, created.id);

    if (isTestStore) {
      const { error: priceError } = await client.post<TestStorePricesResponse>({
        url: "/projects/{project_id}/products/{product_id}/test_store_prices",
        path: { project_id: project.id, product_id: created.id },
        body: { prices: def.prices },
      });
      if (priceError) {
        if (typeof priceError === "object" && "type" in priceError && priceError["type"] === "resource_already_exists") {
          console.log("Prices already exist");
        } else {
          console.warn("Price setup warning:", JSON.stringify(priceError));
        }
      } else {
        console.log(`Set prices for ${label}`);
      }
    }
    return created;
  };

  const PRODUCTS: Record<string, ProductDef> = {
    remove_ads: {
      storeId: PRODUCT_REMOVE_ADS_ID,
      playStoreId: PRODUCT_REMOVE_ADS_ID,
      displayName: PRODUCT_REMOVE_ADS_DISPLAY_NAME,
      title: PRODUCT_REMOVE_ADS_TITLE,
      prices: [{ amount_micros: 990000, currency: "USD" }],
    },
    starter_pack: {
      storeId: PRODUCT_STARTER_PACK_ID,
      playStoreId: PRODUCT_STARTER_PACK_ID,
      displayName: PRODUCT_STARTER_PACK_DISPLAY_NAME,
      title: PRODUCT_STARTER_PACK_TITLE,
      prices: [{ amount_micros: 990000, currency: "USD" }],
    },
    mega_pack: {
      storeId: PRODUCT_MEGA_PACK_ID,
      playStoreId: PRODUCT_MEGA_PACK_ID,
      displayName: PRODUCT_MEGA_PACK_DISPLAY_NAME,
      title: PRODUCT_MEGA_PACK_TITLE,
      prices: [{ amount_micros: 2990000, currency: "USD" }],
    },
  };

  const testRemoveAds = await ensureProduct(testApp, "Test-RemoveAds", PRODUCTS.remove_ads, true);
  const appRemoveAds = await ensureProduct(appStoreApp, "AppStore-RemoveAds", PRODUCTS.remove_ads, false);
  const playRemoveAds = await ensureProduct(playStoreApp, "PlayStore-RemoveAds", PRODUCTS.remove_ads, false);

  const testStarter = await ensureProduct(testApp, "Test-StarterPack", PRODUCTS.starter_pack, true);
  const appStarter = await ensureProduct(appStoreApp, "AppStore-StarterPack", PRODUCTS.starter_pack, false);
  const playStarter = await ensureProduct(playStoreApp, "PlayStore-StarterPack", PRODUCTS.starter_pack, false);

  const testMega = await ensureProduct(testApp, "Test-MegaPack", PRODUCTS.mega_pack, true);
  const appMega = await ensureProduct(appStoreApp, "AppStore-MegaPack", PRODUCTS.mega_pack, false);
  const playMega = await ensureProduct(playStoreApp, "PlayStore-MegaPack", PRODUCTS.mega_pack, false);

  // ── Entitlement: no_ads ───────────────────────────────────────────────────
  const { data: existingEntitlements, error: listEntErr } = await listEntitlements({
    client,
    path: { project_id: project.id },
    query: { limit: 20 },
  });
  if (listEntErr) throw new Error("Failed to list entitlements");

  let noAdsEntitlement: Entitlement | undefined = existingEntitlements.items?.find(
    (e) => e.lookup_key === ENTITLEMENT_NO_ADS_ID
  );
  if (!noAdsEntitlement) {
    const { data, error } = await createEntitlement({
      client,
      path: { project_id: project.id },
      body: { lookup_key: ENTITLEMENT_NO_ADS_ID, display_name: ENTITLEMENT_NO_ADS_DISPLAY },
    });
    if (error) throw new Error("Failed to create no_ads entitlement");
    noAdsEntitlement = data;
    console.log("Created no_ads entitlement:", noAdsEntitlement.id);
  } else {
    console.log("no_ads entitlement exists:", noAdsEntitlement.id);
  }

  const { error: attachNoAdsErr } = await attachProductsToEntitlement({
    client,
    path: { project_id: project.id, entitlement_id: noAdsEntitlement.id },
    body: { product_ids: [testRemoveAds.id, appRemoveAds.id, playRemoveAds.id] },
  });
  if (attachNoAdsErr && (attachNoAdsErr as any).type !== "unprocessable_entity_error") {
    throw new Error("Failed to attach remove_ads products to entitlement");
  }
  console.log("Attached remove_ads products to no_ads entitlement");

  // ── Offering ─────────────────────────────────────────────────────────────
  const { data: existingOfferings, error: listOffErr } = await listOfferings({
    client,
    path: { project_id: project.id },
    query: { limit: 20 },
  });
  if (listOffErr) throw new Error("Failed to list offerings");

  let offering: Offering | undefined = existingOfferings.items?.find(
    (o) => o.lookup_key === OFFERING_IDENTIFIER
  );
  if (!offering) {
    const { data, error } = await createOffering({
      client,
      path: { project_id: project.id },
      body: { lookup_key: OFFERING_IDENTIFIER, display_name: OFFERING_DISPLAY_NAME },
    });
    if (error) throw new Error("Failed to create offering");
    offering = data;
    console.log("Created offering:", offering.id);
  } else {
    console.log("Offering exists:", offering.id);
  }

  if (!offering.is_current) {
    const { error } = await updateOffering({
      client,
      path: { project_id: project.id, offering_id: offering.id },
      body: { is_current: true },
    });
    if (error) throw new Error("Failed to set offering as current");
    console.log("Set offering as current");
  }

  // ── Packages ─────────────────────────────────────────────────────────────
  const { data: existingPackages, error: listPkgErr } = await listPackages({
    client,
    path: { project_id: project.id, offering_id: offering.id },
    query: { limit: 20 },
  });
  if (listPkgErr) throw new Error("Failed to list packages");

  const ensurePackage = async (lookupKey: string, displayName: string): Promise<Package> => {
    const existing = existingPackages.items?.find((p) => p.lookup_key === lookupKey);
    if (existing) {
      console.log(`Package ${lookupKey} exists:`, existing.id);
      return existing;
    }
    const { data, error } = await createPackages({
      client,
      path: { project_id: project.id, offering_id: offering!.id },
      body: { lookup_key: lookupKey, display_name: displayName },
    });
    if (error) throw new Error(`Failed to create package ${lookupKey}`);
    console.log(`Created package ${lookupKey}:`, data.id);
    return data;
  };

  const pkgRemoveAds = await ensurePackage(PKG_REMOVE_ADS, PKG_REMOVE_ADS_DISPLAY);
  const pkgStarter = await ensurePackage(PKG_STARTER, PKG_STARTER_DISPLAY);
  const pkgMega = await ensurePackage(PKG_MEGA, PKG_MEGA_DISPLAY);

  const attachPkg = async (pkg: Package, products: Product[]) => {
    const { error } = await attachProductsToPackage({
      client,
      path: { project_id: project.id, package_id: pkg.id },
      body: {
        products: products.map((p) => ({ product_id: p.id, eligibility_criteria: "all" as const })),
      },
    });
    if (error && (error as any).type !== "unprocessable_entity_error") {
      console.warn(`Package attach warning for ${pkg.lookup_key}:`, JSON.stringify(error));
    } else {
      console.log(`Attached products to package ${pkg.lookup_key}`);
    }
  };

  await attachPkg(pkgRemoveAds, [testRemoveAds, appRemoveAds, playRemoveAds]);
  await attachPkg(pkgStarter, [testStarter, appStarter, playStarter]);
  await attachPkg(pkgMega, [testMega, appMega, playMega]);

  // ── API Keys ──────────────────────────────────────────────────────────────
  const getKeys = async (app: App) => {
    const { data, error } = await listAppPublicApiKeys({
      client,
      path: { project_id: project.id, app_id: app.id },
    });
    if (error) throw new Error(`Failed to list keys for ${app.type}`);
    return data?.items.map((k) => k.key).join(", ") ?? "N/A";
  };

  const testKeys = await getKeys(testApp);
  const iosKeys = await getKeys(appStoreApp);
  const androidKeys = await getKeys(playStoreApp);

  console.log("\n====================");
  console.log("RevenueCat setup complete!");
  console.log("Project ID:", project.id);
  console.log("Test Store App ID:", testApp.id);
  console.log("App Store App ID:", appStoreApp.id);
  console.log("Play Store App ID:", playStoreApp.id);
  console.log("Entitlement (no_ads):", ENTITLEMENT_NO_ADS_ID);
  console.log("Public API Keys - Test Store:", testKeys);
  console.log("Public API Keys - App Store:", iosKeys);
  console.log("Public API Keys - Play Store:", androidKeys);
  console.log("====================\n");
}

seedRevenueCat().catch(console.error);
