import React, { useCallback, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated as RNAnimated,
  Easing as RNEasing,
  Modal,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { Car, Banknote, Undo2, Tag, ChevronRight, Check, Printer, Plus, Minus, Search } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBg, Pressable, Eyebrow, AnimatedNumber, GradientText } from '@/components/Chrome';
import { TopBar } from '@/components/TopBar';
import { c } from '@/components/tokens';
import {
  getAllStores,
  getStoreById,
  createTransaction,
  getProducts,
  createProduct,
} from '@/database/queries';
import type { Store, OperationType, Product } from '@/types';
import { operationToTxType } from '@/types';
import type { RootStackParamList } from '@/navigation/types';
import { formatDAFull, parseDAInput } from '@/utils/currency';
import { isoNow } from '@/utils/dates';
import { printDeliveryNote } from '@/services/printerService';
import { useApp } from '@/store/AppContext';
import { getInitials } from '@/utils/storeHelpers';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Toast from 'react-native-toast-message';
import { useEffect, useRef } from 'react';

// Platform check removed since New Architecture is used

type Route = RouteProp<RootStackParamList, 'NewOperation'>;

const TYPES: { Icon: any; label: string; id: OperationType; color: string }[] = [
  { Icon: Car, label: 'Livraison', id: 'livraison', color: c.lime },
  { Icon: Banknote, label: 'Paiement', id: 'paiement', color: c.green },
  { Icon: Undo2, label: 'Retour', id: 'retour', color: c.blue },
  { Icon: Tag, label: 'Avoir', id: 'avoir', color: c.amber },
];

export function NewOperationScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { refresh } = useApp();

  const [type, setType] = useState<OperationType>(route.params?.type || 'livraison');
  const [storeId, setStoreId] = useState<string | undefined>(route.params?.storeId);
  const [store, setStore] = useState<Store | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Articles for 'livraison'
  const [articles, setArticles] = useState<{ id: string; name: string; qty: number; price: number }[]>([]);
  
  // Modal for adding products
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [searchProduct, setSearchProduct] = useState('');
  
  // Modal/Inputs for creating products
  const [isCreateProductVisible, setIsCreateProductVisible] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductBarcode, setNewProductBarcode] = useState('');
  
  // Amount for others
  const [paymentAmount, setPaymentAmount] = useState('0');
  
  // Note
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    try {
      const sList = await getAllStores();
      setStores(sList);
      const pList = await getProducts();
      setProducts(pList);

      if (storeId) {
        setStore(await getStoreById(storeId));
      }
    } catch (e: any) {
      console.error('Load error:', e);
      Toast.show({
        type: 'error',
        text1: 'Erreur de chargement',
        text2: e.message || 'Impossible de charger les données.',
      });
    }
  }, [storeId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const isLiv = type === 'livraison';
  const activeType = TYPES.find((t) => t.id === type)!;
  
  const total = isLiv 
    ? articles.reduce((sum, a) => sum + a.qty * a.price, 0)
    : parseDAInput(paymentAmount);

  const updateQty = (idx: number, delta: number) => {
    setArticles(prev => {
      const updated = prev.map((a, i) => (i === idx ? { ...a, qty: Math.max(0, a.qty + delta) } : a));
      return updated.filter(a => a.qty > 0);
    });
  };

  const addArticle = (p: Product) => {
    setArticles((prev) => {
      const exists = prev.find((a) => a.id === p.product_id);
      if (exists) {
        return prev.map((a) =>
          a.id === p.product_id ? { ...a, qty: a.qty + 1 } : a
        );
      } else {
        return [
          ...prev,
          { id: p.product_id, name: p.name, qty: 1, price: p.unit_price },
        ];
      }
    });
    Toast.show({
      type: 'success',
      text1: 'Article ajouté',
      text2: `${p.name} a été ajouté à la livraison.`,
      position: 'bottom',
    });
  };

  const getProductCountInCart = (productId: string) => {
    const found = articles.find((a) => a.id === productId);
    return found ? found.qty : 0;
  };

  const handleCreateProduct = async () => {
    if (!newProductName.trim()) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Le nom du produit est requis' });
      return;
    }
    const price = parseFloat(newProductPrice);
    if (isNaN(price) || price <= 0) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Le prix unitaire doit être supérieur à 0' });
      return;
    }

    // Auto-generate barcode if empty (standard EAN-13 prefix 613 for Algeria)
    const barcode = newProductBarcode.trim() || `613${Math.floor(1000000000 + Math.random() * 9000000000).toString()}`;

    try {
      const p = await createProduct({
        name: newProductName.trim(),
        barcode,
        unitPrice: price,
      });

      // Update state of available products
      setProducts(prev => [p, ...prev]);

      // Automatically add it to the active articles list
      addArticle(p);

      // Reset form states and close modal
      setNewProductName('');
      setNewProductPrice('');
      setNewProductBarcode('');
      setIsCreateProductVisible(false);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible de créer le produit (code barre existant ?)' });
    }
  };

  const productSummary = articles.filter(a => a.qty > 0).map(a => a.name.split(' ')[0]).join(' · ');

  const handleTypeChange = (newType: OperationType) => {
    setType(newType);
  };

  const activeIndex = TYPES.findIndex(t => t.id === type);
  const [segmentLayout, setSegmentLayout] = useState({ width: 0, height: 0 });
  const animatedTranslateX = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    if (segmentLayout.width > 0) {
      RNAnimated.timing(animatedTranslateX, {
        toValue: activeIndex * (segmentLayout.width + 2),
        duration: 250,
        easing: RNEasing.out(RNEasing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [activeIndex, segmentLayout.width]);

  const confirm = async () => {
    try {
      if (!storeId || !store) {
        Toast.show({ type: 'error', text1: 'Magasin requis', text2: 'Sélectionnez un magasin.' });
        return;
      }
      if (total <= 0) {
        Toast.show({ type: 'error', text1: 'Montant invalide', text2: 'Entrez un montant supérieur à 0.' });
        return;
      }

      const txType = operationToTxType[type];
      const itemsToSave = isLiv
        ? articles.filter(a => a.qty > 0).map(a => ({
            productId: a.id,
            quantity: a.qty,
            priceAtTime: a.price,
          }))
        : undefined;

      const tx = await createTransaction({
        storeId,
        txType,
        amount: total,
        note: note || productSummary || activeType.label,
        items: itemsToSave,
        referenceNo: `BL-${Date.now().toString(36).toUpperCase()}`,
      });

      await refresh();

      if (isLiv) {
        const print = await printDeliveryNote({
          store,
          transaction: tx,
          items: itemsToSave?.map(i => ({
            item_id: '',
            tx_id: tx.tx_id,
            product_id: i.productId,
            quantity: i.quantity,
            price_at_time: i.priceAtTime,
            product_name: articles.find(a => a.id === i.productId)?.name,
          })) ?? [],
        });
        Toast.show({ type: 'success', text1: 'Livraison enregistrée', text2: print.message });
      } else {
        Toast.show({ type: 'success', text1: 'Opération enregistrée', text2: `${activeType.label} confirmée.` });
      }

      navigation.goBack();
    } catch (e: any) {
      console.error(e);
      Toast.show({ type: 'error', text1: 'Erreur', text2: e.message || 'Impossible de sauvegarder la transaction.' });
    }
  };

  return (
    <StatusBg>
      <TopBar title="Opération" onBack={() => navigation.goBack()} rightIcon="none" />

      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 70, paddingBottom: insets.bottom + 120 }} keyboardShouldPersistTaps="handled">
        
        {/* Segmented Control */}
        <View style={styles.segmentContainer}>
          <View style={styles.segmentInner}>
            {segmentLayout.width > 0 && (
              <RNAnimated.View style={[styles.activeIndicatorWrapper, { width: segmentLayout.width, height: segmentLayout.height, backgroundColor: activeType.color, shadowColor: activeType.color, transform: [{ translateX: animatedTranslateX }] }]}>
                <View style={styles.activeIndicatorInner}>
                  <LinearGradient
                    colors={[activeType.color, activeType.color + 'cc']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                </View>
              </RNAnimated.View>
            )}

            {TYPES.map((t, i) => {
              const active = t.id === type;
              return (
                <Pressable
                  key={t.id}
                  stretch={false}
                  onPress={() => handleTypeChange(t.id)}
                  onLayout={(e) => {
                    if (i === 0) setSegmentLayout({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height });
                  }}
                  style={styles.segmentBtnWrapper}
                >
                  <View style={styles.segmentBtnContent}>
                    <t.Icon size={18} color={active ? c.ink : c.white40} strokeWidth={2.4} />
                    <Text style={[styles.segmentBtnText, { color: active ? c.ink : c.white40 }]}>
                      {t.label}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Total Hero */}
        <View style={styles.heroContainer}>
          <Eyebrow style={{ justifyContent: 'center', marginBottom: 14 }} dot={activeType.color}>
            Montant total
          </Eyebrow>
          <View style={styles.heroAmountRow}>
            <AnimatedNumber 
              value={total} 
              duration={500} 
              style={StyleSheet.flatten([
                styles.heroAmountValue, 
                { color: activeType.color, textShadowColor: '#000000', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 0 }
              ])} 
            />
            <Text style={styles.heroCurrency}>DA</Text>
          </View>
        </View>

        {/* Store Selection */}
        <View style={styles.sectionWrapper}>
          <Eyebrow style={{ marginBottom: 10 }}>Magasin</Eyebrow>
          {store ? (
            <Pressable
              style={styles.storeCard}
              onPress={() => {
                // For simplicity, just clearing store to show picker again, normally a modal would be better
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setStore(null);
                setStoreId(undefined);
              }}
            >
              <View style={styles.storeInitialsBox}>
                <Text style={styles.storeInitialsText}>{getInitials(store.name)}</Text>
              </View>
              <View style={styles.storeMid}>
                <Text style={styles.storeName}>{store.name}</Text>
                <Text style={[styles.storeSub, { color: store.current_balance > 0 ? c.red : c.green }]}>
                  {store.current_balance > 0 ? `Dette ${formatDAFull(store.current_balance)}` : 'Soldé'}
                </Text>
              </View>
              <ChevronRight size={14} color={c.white40} />
            </Pressable>
          ) : (
            <View style={styles.storePicker}>
              {stores.slice(0, 10).map((s) => (
                <Pressable
                  key={s.store_id}
                  style={styles.storePickerItem}
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setStoreId(s.store_id);
                    setStore(s);
                  }}
                >
                  <Text style={styles.storePickerName}>{s.name}</Text>
                </Pressable>
              ))}
              <Text style={{ fontSize: 11, color: c.white40, textAlign: 'center', marginTop: 8 }}>
                Recherchez ou sélectionnez un magasin ci-dessus
              </Text>
            </View>
          )}
        </View>

        {/* Details Input */}
        {isLiv ? (
          <View style={styles.sectionWrapper}>
            <View style={styles.articlesHeader}>
              <Eyebrow>Articles ({articles.length})</Eyebrow>
              <Pressable stretch={false} onPress={() => setIsAddModalVisible(true)}>
                <Text style={styles.addArticleText}>+ Ajouter</Text>
              </Pressable>
            </View>
            <View style={styles.articlesList}>
              {articles.length === 0 ? (
                <View style={styles.emptyArticlesContainer}>
                  <Text style={styles.emptyArticlesText}>Aucun article sélectionné</Text>
                  <Pressable
                    stretch={false}
                    onPress={() => setIsAddModalVisible(true)}
                    style={styles.emptyArticlesBtn}
                  >
                    <LinearGradient colors={['#1d1d1d', '#161616']} style={StyleSheet.absoluteFillObject} />
                    <Text style={styles.emptyArticlesBtnText}>+ Ajouter des articles</Text>
                  </Pressable>
                </View>
              ) : (
                articles.map((a, i) => (
                  <View key={a.id} style={[styles.articleRow, i === articles.length - 1 && { borderBottomWidth: 0 }]}>
                    <View style={styles.articleMid}>
                      <Text style={styles.articleName}>{a.name}</Text>
                      <Text style={styles.articlePrice}>{formatDAFull(a.price)} / unité</Text>
                    </View>
                    <View style={styles.stepper}>
                      <Pressable stretch={false} onPress={() => updateQty(i, -1)} style={styles.stepperBtn}>
                        <Minus size={11} color={a.qty === 0 ? c.white40 : c.white} strokeWidth={2.5} />
                      </Pressable>
                      <Text style={styles.stepperVal}>{a.qty}</Text>
                      <Pressable stretch={false} onPress={() => updateQty(i, 1)} style={styles.stepperBtnAdd}>
                        <LinearGradient colors={['#9bff1f', c.lime]} style={StyleSheet.absoluteFillObject} />
                        <Plus size={11} color={c.ink} strokeWidth={3} />
                      </Pressable>
                    </View>
                    <Text style={styles.articleTotal}>
                      {a.qty * a.price > 0 ? formatDAFull(a.qty * a.price).replace(' DA', '') : '0'}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>
        ) : (
          <View style={styles.sectionWrapper}>
            <Eyebrow style={{ marginBottom: 10 }}>Montant en DA</Eyebrow>
            <View style={styles.amountInputWrapper}>
              <LinearGradient colors={['#1d1d1d', '#141414']} style={StyleSheet.absoluteFillObject} />
              <TextInput
                style={styles.amountInput}
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={c.white40}
              />
            </View>
            <View style={styles.amountPresets}>
              {[5000, 10000, 20000, 50000].map(v => {
                const active = paymentAmount === v.toString();
                return (
                  <Pressable
                    key={v}
                    stretch={false}
                    onPress={() => setPaymentAmount(v.toString())}
                    style={[styles.presetBtn, active && styles.presetBtnActive]}
                  >
                    {!active && <LinearGradient colors={['#1d1d1d', '#161616']} style={StyleSheet.absoluteFillObject} />}
                    <Text style={[styles.presetText, { color: active ? c.ink : c.white }]}>
                      {formatDAFull(v)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        <View style={[styles.sectionWrapper, { marginTop: 16 }]}>
          <Eyebrow style={{ marginBottom: 10 }}>Note (optionnelle)</Eyebrow>
          <View style={styles.amountInputWrapper}>
            <LinearGradient colors={['#1d1d1d', '#141414']} style={StyleSheet.absoluteFillObject} />
            <TextInput
              style={[styles.amountInput, { fontSize: 14, textAlign: 'left', fontWeight: '400' }]}
              value={note}
              onChangeText={setNote}
              placeholder="Ex: Paiement en espèces"
              placeholderTextColor={c.white40}
            />
          </View>
        </View>

      </ScrollView>

      {/* Action Dock */}
      <View style={[styles.dockContainer, { paddingBottom: (insets.bottom || 24) + 12, paddingTop: 48 }]} pointerEvents="box-none">
        <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFillObject} pointerEvents="none" />
        <LinearGradient
          colors={['rgba(10,10,10,0)', 'rgba(10,10,10,0.6)', '#0A0A0A']}
          locations={[0, 0.5, 0.9]}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
        <View style={styles.dockInner}>
          {isLiv && (
            <Pressable stretch={false} style={styles.dockBtnSecondary}>
              <LinearGradient colors={['#1d1d1d', '#161616']} style={[StyleSheet.absoluteFillObject, { borderRadius: 100 }]} />
              <Printer size={15} color={c.white} strokeWidth={2.2} />
              <Text style={styles.dockSecondaryText}>BL</Text>
            </Pressable>
          )}
          
          <View style={{ flex: 1, position: 'relative' }}>
            <View style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: activeType.color,
                borderRadius: 100,
                shadowColor: activeType.color,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.9,
                shadowRadius: 32,
                elevation: 24,
              }
            ]} />
            <Pressable stretch={false} onPress={confirm} style={styles.dockBtnPrimary}>
              <LinearGradient
                colors={[activeType.color + 'ee', activeType.color, activeType.color + 'cc']}
                locations={[0, 0.5, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[StyleSheet.absoluteFillObject, { borderRadius: 100 }]}
              />
              <Check size={16} color={c.ink} strokeWidth={3} />
              <Text style={styles.dockPrimaryText}>Confirmer {activeType.label.toLowerCase()}</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Modal for adding products */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            stretch={true}
            onPress={() => setIsAddModalVisible(false)}
            style={StyleSheet.absoluteFillObject}
          >
            <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.75)' }} />
          </Pressable>

          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ajouter des articles</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Pressable
                  stretch={false}
                  onPress={() => {
                    setNewProductName(searchProduct);
                    setIsCreateProductVisible(true);
                  }}
                  style={styles.modalNewProductBtn}
                >
                  <Text style={styles.modalNewProductBtnText}>+ Nouveau</Text>
                </Pressable>
                <Pressable
                  stretch={false}
                  onPress={() => {
                    setIsAddModalVisible(false);
                    setSearchProduct('');
                  }}
                  style={styles.modalCloseBtn}
                >
                  <Text style={styles.modalCloseBtnText}>Fermer</Text>
                </Pressable>
              </View>
            </View>

            {/* Search Box */}
            <View style={styles.modalSearchRow}>
              <LinearGradient colors={['#1d1d1d', '#161616']} style={styles.modalSearchInputContainer}>
                <Search size={15} color={c.white40} strokeWidth={2} />
                <TextInput
                  style={styles.modalSearchInput}
                  placeholder="Rechercher un produit…"
                  placeholderTextColor={c.white40}
                  value={searchProduct}
                  onChangeText={setSearchProduct}
                />
              </LinearGradient>
            </View>

            {/* Product List */}
            <ScrollView style={styles.modalProductList} keyboardShouldPersistTaps="handled">
              {products
                .filter((p) =>
                  p.name.toLowerCase().includes(searchProduct.toLowerCase())
                )
                .map((p, idx, arr) => {
                  const qtyInCart = getProductCountInCart(p.product_id);
                  return (
                    <View
                      key={p.product_id}
                      style={[
                        styles.modalProductRow,
                        idx === arr.length - 1 && { borderBottomWidth: 0 },
                      ]}
                    >
                      <View style={styles.modalProductInfo}>
                        <Text style={styles.modalProductName}>{p.name}</Text>
                        <Text style={styles.modalProductPrice}>
                          {formatDAFull(p.unit_price)}
                        </Text>
                      </View>
                      <View style={styles.modalActions}>
                        {qtyInCart > 0 && (
                          <View style={styles.qtyBadge}>
                            <Text style={styles.qtyBadgeText}>
                              {qtyInCart} sélectionné{qtyInCart > 1 ? 's' : ''}
                            </Text>
                          </View>
                        )}
                        <Pressable
                          stretch={false}
                          onPress={() => addArticle(p)}
                          style={styles.modalAddBtn}
                        >
                          <LinearGradient
                            colors={['#9bff1f', c.lime]}
                            style={StyleSheet.absoluteFillObject}
                          />
                          <Plus size={14} color={c.ink} strokeWidth={3} />
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              {products.filter((p) =>
                p.name.toLowerCase().includes(searchProduct.toLowerCase())
              ).length === 0 && (
                <View style={styles.modalEmptyContainer}>
                  <Text style={styles.modalEmptyText}>Aucun produit trouvé</Text>
                  <Pressable
                    stretch={false}
                    onPress={() => {
                      setNewProductName(searchProduct);
                      setIsCreateProductVisible(true);
                    }}
                    style={styles.modalEmptyCreateBtn}
                  >
                    <LinearGradient colors={['#1d1d1d', '#161616']} style={StyleSheet.absoluteFillObject} />
                    <Text style={styles.modalEmptyCreateBtnText}>
                      Créer "{searchProduct || 'Nouveau produit'}"
                    </Text>
                  </Pressable>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal for creating a new product */}
      <Modal
        visible={isCreateProductVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCreateProductVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            stretch={true}
            onPress={() => setIsCreateProductVisible(false)}
            style={StyleSheet.absoluteFillObject}
          >
            <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)' }} />
          </Pressable>

          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nouveau produit</Text>
              <Pressable
                stretch={false}
                onPress={() => setIsCreateProductVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseBtnText}>Annuler</Text>
              </Pressable>
            </View>

            <ScrollView style={{ paddingHorizontal: 22 }} keyboardShouldPersistTaps="handled">
              <View style={styles.createFormContainer}>
                
                {/* Product Name */}
                <View style={styles.inputGroup}>
                  <Eyebrow style={{ marginBottom: 8 }}>Nom du produit *</Eyebrow>
                  <View style={styles.createInputWrapper}>
                    <LinearGradient colors={['#1d1d1d', '#141414']} style={StyleSheet.absoluteFillObject} />
                    <TextInput
                      style={styles.createInput}
                      placeholder="Ex: Sucre Cristal 1Kg"
                      placeholderTextColor={c.white40}
                      value={newProductName}
                      onChangeText={setNewProductName}
                    />
                  </View>
                </View>

                {/* Product Price */}
                <View style={styles.inputGroup}>
                  <Eyebrow style={{ marginBottom: 8 }}>Prix unitaire (DA) *</Eyebrow>
                  <View style={styles.createInputWrapper}>
                    <LinearGradient colors={['#1d1d1d', '#141414']} style={StyleSheet.absoluteFillObject} />
                    <TextInput
                      style={styles.createInput}
                      placeholder="Ex: 180"
                      placeholderTextColor={c.white40}
                      value={newProductPrice}
                      onChangeText={setNewProductPrice}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Product Barcode */}
                <View style={styles.inputGroup}>
                  <Eyebrow style={{ marginBottom: 8 }}>Code barre (optionnel)</Eyebrow>
                  <View style={styles.createInputWrapper}>
                    <LinearGradient colors={['#1d1d1d', '#141414']} style={StyleSheet.absoluteFillObject} />
                    <TextInput
                      style={styles.createInput}
                      placeholder="Laisser vide pour générer"
                      placeholderTextColor={c.white40}
                      value={newProductBarcode}
                      onChangeText={setNewProductBarcode}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Submit button */}
                <View style={{ marginTop: 24, marginBottom: 12, position: 'relative', height: 48 }}>
                  <View style={[
                    StyleSheet.absoluteFillObject,
                    {
                      backgroundColor: c.lime,
                      borderRadius: 100,
                      shadowColor: c.lime,
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.5,
                      shadowRadius: 16,
                      elevation: 8,
                    }
                  ]} />
                  <Pressable
                    stretch={true}
                    onPress={handleCreateProduct}
                    style={styles.createSubmitBtn}
                  >
                    <LinearGradient
                      colors={['#9bff1f', c.lime]}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <Check size={16} color={c.ink} strokeWidth={3} />
                    <Text style={styles.createSubmitBtnText}>Créer le produit</Text>
                  </Pressable>
                </View>

              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </StatusBg>
  );
}

const styles = StyleSheet.create({
  segmentContainer: {
    paddingHorizontal: 22,
    paddingBottom: 28,
  },
  segmentInner: {
    flexDirection: 'row',
    padding: 6,
    backgroundColor: 'rgba(26,26,26,0.7)',
    borderWidth: 1,
    borderColor: c.borderLight,
    borderRadius: 18,
    gap: 2,
    position: 'relative',
  },
  activeIndicatorWrapper: {
    position: 'absolute',
    top: 6,
    left: 6,
    borderRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 4,
  },
  activeIndicatorInner: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    overflow: 'hidden',
  },
  segmentBtnWrapper: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  segmentBtnContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
  },
  segmentBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  heroContainer: {
    paddingHorizontal: 22,
    paddingBottom: 32,
    alignItems: 'center',
    position: 'relative',
  },
  heroAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  heroAmountValue: {
    fontSize: 64,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: -2.5,
    lineHeight: 68,
    paddingBottom: 12,
  },
  heroCurrency: {
    fontSize: 18,
    fontFamily: 'Inter_500Medium',
    color: c.white40,
  },
  sectionWrapper: {
    paddingHorizontal: 22,
    paddingBottom: 20,
  },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  storeInitialsBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeInitialsText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: c.white,
  },
  storeMid: {
    flex: 1,
  },
  storeName: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    color: c.white,
  },
  storeSub: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  storePicker: {
    backgroundColor: c.bg3,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: c.borderLight,
  },
  storePickerItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: c.borderLight,
  },
  storePickerName: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: c.white,
  },
  articlesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  addArticleText: {
    color: c.lime,
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  articlesList: {
    backgroundColor: '#161616',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: c.borderLight,
  },
  articleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  articleMid: {
    flex: 1,
  },
  articleName: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: c.white,
    marginBottom: 4,
    textShadowColor: '#000000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 0,
  },
  articlePrice: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: c.white40,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0e0e0e',
    borderWidth: 1,
    borderColor: c.borderLight,
    borderRadius: 100,
    padding: 2,
  },
  stepperBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnAdd: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  stepperVal: {
    minWidth: 26,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: c.white,
  },
  articleTotal: {
    minWidth: 56,
    textAlign: 'right',
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    color: c.white,
    letterSpacing: -0.2,
    textShadowColor: '#000000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 0,
  },
  amountInputWrapper: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.borderLight,
    overflow: 'hidden',
  },
  amountInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 22,
    fontFamily: 'Inter_600SemiBold',
    color: c.white,
    letterSpacing: -0.5,
  },
  amountPresets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  presetBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: c.borderLight,
    overflow: 'hidden',
  },
  presetBtnActive: {
    backgroundColor: c.white,
    borderWidth: 0,
  },
  presetText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  dockContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 30,
  },
  dockInner: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  dockBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: c.borderLight,
    overflow: 'hidden',
  },
  dockSecondaryText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: c.white,
  },
  dockBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 100,
    paddingVertical: 16,
    overflow: 'hidden',
  },
  dockPrimaryText: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: c.ink,
    letterSpacing: -0.2,
  },
  emptyArticlesContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyArticlesText: {
    fontSize: 13,
    color: c.white40,
    fontFamily: 'Inter_400Regular',
  },
  emptyArticlesBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: c.borderLight,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyArticlesBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: c.white,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#161616',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: c.borderLight,
    maxHeight: '75%',
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: c.white,
    letterSpacing: -0.4,
  },
  modalCloseBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  modalCloseBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: c.white,
  },
  modalSearchRow: {
    paddingHorizontal: 22,
    marginBottom: 16,
  },
  modalSearchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: c.borderLight,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: c.white,
    padding: 0,
  },
  modalProductList: {
    paddingHorizontal: 22,
  },
  modalProductRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  modalProductInfo: {
    flex: 1,
    marginRight: 12,
  },
  modalProductName: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: c.white,
    marginBottom: 4,
  },
  modalProductPrice: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: c.white40,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  qtyBadge: {
    backgroundColor: 'rgba(155, 255, 31, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(155, 255, 31, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 100,
  },
  qtyBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: c.lime,
  },
  modalAddBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  modalEmptyText: {
    paddingVertical: 32,
    textAlign: 'center',
    fontSize: 12,
    color: c.white40,
    fontFamily: 'Inter_400Regular',
  },
  modalNewProductBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 100,
    backgroundColor: 'rgba(127, 227, 0, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(127, 227, 0, 0.25)',
  },
  modalNewProductBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: c.lime,
  },
  modalEmptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  modalEmptyCreateBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: c.borderLight,
    overflow: 'hidden',
  },
  modalEmptyCreateBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: c.white,
  },
  createFormContainer: {
    paddingVertical: 16,
    gap: 20,
  },
  inputGroup: {
    width: '100%',
  },
  createInputWrapper: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.borderLight,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  createInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: c.white,
  },
  createSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 100,
    height: 48,
    overflow: 'hidden',
  },
  createSubmitBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: c.ink,
    letterSpacing: -0.2,
  },
});
