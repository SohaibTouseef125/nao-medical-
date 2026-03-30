'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Upload,
  Share2,
  LogOut,
  FileUp,
  Users,
  Trash2,
  X,
  Check,
  Menu,
} from 'lucide-react';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { Card, CardContent } from './components/Card';
import { Modal } from './components/Modal';
import { ToastProvider, useToast } from './components/Toast';
import { Spinner, Skeleton, SidebarSkeleton } from './components/Loading';
import { EmptyState } from './components/EmptyState';
import { Avatar } from './components/Avatar';
import { Badge } from './components/Badge';
import { DocumentItem } from './components/DocumentItem';
import { ShareItem } from './components/ShareItem';
import { EditorToolbar } from './components/EditorToolbar';

// Types
interface User {
  id: string;
  email: string;
  name: string;
}

interface Document {
  id: string;
  title: string;
  content: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  owner_name?: string;
  permission?: string;
}

interface Share {
  id: string;
  document_id: string;
  user_id: string;
  email: string;
  name: string;
  permission: string;
}

// Demo users for login
const DEMO_USERS = [
  { id: 'user1', email: 'alice@example.com', name: 'Alice Johnson' },
  { id: 'user2', email: 'bob@example.com', name: 'Bob Smith' },
  { id: 'user3', email: 'carol@example.com', name: 'Carol Williams' },
];

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<{ owned: Document[]; shared: Document[] }>({ owned: [], shared: [] });
  const [currentDoc, setCurrentDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shares, setShares] = useState<Share[]>([]);
  const [shareEmail, setShareEmail] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Auth state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  
  const toast = useToast();

  // Login handler
  const handleLogin = async (email: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUser(data.user);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userName', data.user.name);
      toast.success('Welcome back!', `Logged in as ${data.user.name}`);
    } catch (err: any) {
      toast.error('Login failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName || !registerEmail) {
      toast.error('Invalid form', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registerEmail, name: registerName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      // Auto login after registration
      setUser(data.user);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userName', data.user.name);
      toast.success('Account created!', `Welcome, ${data.user.name}!`);
      setRegisterName('');
      setRegisterEmail('');
    } catch (err: any) {
      toast.error('Registration failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load documents
  const loadDocuments = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/documents?userId=${user.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDocuments(data.documents);
    } catch (err: any) {
      toast.error('Failed to load documents', err.message);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    const savedUser = localStorage.getItem('userId');
    if (savedUser) {
      setUser({
        id: savedUser,
        email: localStorage.getItem('userEmail') || '',
        name: localStorage.getItem('userName') || '',
      });
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user, loadDocuments]);

  // Create document
  const createDocument = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerId: user!.id, title: 'Untitled Document' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await loadDocuments();
      openDocument(data.document);
      toast.success('Document created', 'Start typing to add content');
    } catch (err: any) {
      toast.error('Failed to create document', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Open document
  const openDocument = (doc: Document) => {
    setCurrentDoc(doc);
    setTitle(doc.title);
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = doc.content || '';
        setHasChanges(false);
      }
    }, 0);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Save document
  const saveDocument = async () => {
    if (!currentDoc || !hasChanges) return;
    setIsSaving(true);
    try {
      const content = editorRef.current?.innerHTML || '';
      const res = await fetch('/api/documents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentDoc.id,
          title,
          content,
          userId: user!.id
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCurrentDoc(data.document);
      await loadDocuments();
      setHasChanges(false);
      toast.success('Document saved', 'Your changes have been saved successfully');
    } catch (err: any) {
      toast.error('Failed to save document', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save on content change
  useEffect(() => {
    if (!currentDoc || !user || !hasChanges) return;
    const timer = setTimeout(() => {
      saveDocument();
    }, 2000);
    return () => clearTimeout(timer);
  }, [currentDoc, user, hasChanges]); // eslint-disable-line react-hooks/exhaustive-deps

  // Delete document
  const deleteDocument = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const res = await fetch(`/api/documents?id=${id}&userId=${user!.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (currentDoc?.id === id) {
        setCurrentDoc(null);
        setTitle('');
      }
      await loadDocuments();
      toast.success('Document deleted');
    } catch (err: any) {
      toast.error('Failed to delete document', err.message);
    }
  };

  // File upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', 'Maximum file size is 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const docRes = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: user!.id,
          title: file.name.replace(/\.[^/.]+$/, ''),
          content: data.upload.content
        }),
      });
      const docData = await docRes.json();
      if (!docRes.ok) throw new Error(docData.error);

      await loadDocuments();
      openDocument(docData.document);
      toast.success('File uploaded', `Created document from ${file.name}`);
    } catch (err: any) {
      toast.error('Upload failed', err.message);
    }
    
    e.target.value = '';
  };

  // Load shares
  const loadShares = async (docId: string) => {
    try {
      const res = await fetch(`/api/share?documentId=${docId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShares(data.shares);
    } catch (err: any) {
      toast.error('Failed to load shares', err.message);
    }
  };

  // Share document
  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDoc || !shareEmail) return;

    setShareLoading(true);
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: currentDoc.id,
          userEmail: shareEmail,
          userId: user!.id
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShares(data.shares);
      setShareEmail('');
      toast.success('Document shared', `Shared with ${shareEmail}`);
    } catch (err: any) {
      toast.error('Failed to share', err.message);
    } finally {
      setShareLoading(false);
    }
  };

  // Remove share
  const removeShare = async (email: string) => {
    if (!currentDoc) return;
    try {
      const res = await fetch('/api/share', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: currentDoc.id,
          userEmail: email,
          userId: user!.id
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShares(data.shares);
      toast.success('Access removed', `Removed sharing with ${email}`);
    } catch (err: any) {
      toast.error('Failed to remove share', err.message);
    }
  };

  // Toolbar commands
  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    setHasChanges(true);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    setUser(null);
    setCurrentDoc(null);
    setDocuments({ owned: [], shared: [] });
    toast.info('Logged out', 'You have been successfully logged out');
  };

  // Handle editor input
  const handleEditorInput = () => {
    setHasChanges(true);
  };

  // Login Screen
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card variant="elevated" padding="none" className="overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 -mx-6 -mt-6 px-6 py-8 mb-6">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  Collaborative Docs
                </h1>
                <p className="text-blue-100 text-sm">
                  Nao Medical Assessment
                </p>
              </motion.div>
            </div>

            {/* Auth Tabs */}
            <div className="flex border-b border-gray-200 mx-6">
              <button
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-3 text-sm font-medium transition-colors relative cursor-pointer ${
                  authMode === 'login'
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Login
                {authMode === 'login' && (
                  <motion.div
                    layoutId="authTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  />
                )}
              </button>
              <button
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-3 text-sm font-medium transition-colors relative cursor-pointer ${
                  authMode === 'register'
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Create Account
                {authMode === 'register' && (
                  <motion.div
                    layoutId="authTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  />
                )}
              </button>
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {authMode === 'login' ? (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Demo Users */}
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        Quick login with demo user
                      </p>
                      {DEMO_USERS.map((u, index) => (
                        <motion.button
                          key={u.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => handleLogin(u.email)}
                          disabled={loading}
                          className="w-full p-3 text-left border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all duration-200 disabled:opacity-50 group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar name={u.name} size="sm" />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors text-sm">
                                {u.name}
                              </div>
                              <div className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors">
                                {u.email}
                              </div>
                            </div>
                            <motion.div
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              whileHover={{ x: 4 }}
                            >
                              <Check className="w-4 h-4 text-blue-600" />
                            </motion.div>
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    <div className="mt-6 text-center">
                      <p className="text-sm text-gray-500">
                        Or{' '}
                        <button
                          onClick={() => setAuthMode('register')}
                          className="text-blue-600 font-medium hover:text-blue-700 hover:underline cursor-pointer"
                        >
                          create your own account
                        </button>
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="register"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <form onSubmit={handleRegister} className="space-y-4">
                      <Input
                        label="Full Name"
                        type="text"
                        placeholder="John Doe"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        disabled={loading}
                        required
                      />
                      <Input
                        label="Email Address"
                        type="email"
                        placeholder="john@example.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        disabled={loading}
                        required
                      />
                      <Button
                        type="submit"
                        disabled={loading || !registerName || !registerEmail}
                        className="w-full mt-4"
                        isLoading={loading}
                      >
                        {loading ? 'Creating Account...' : 'Create Account'}
                      </Button>
                    </form>

                    <div className="mt-6 text-center">
                      <p className="text-sm text-gray-500">
                        Already have an account?{' '}
                        <button
                          onClick={() => setAuthMode('login')}
                          className="text-blue-600 font-medium hover:text-blue-700 hover:underline cursor-pointer"
                        >
                          Sign in
                        </button>
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Info box */}
            {authMode === 'login' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mx-6 mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-800 mb-1">
                      Demo Accounts
                    </p>
                    <p className="text-xs text-amber-700">
                      Login as Alice to create documents, then share with Bob or Carol to test collaboration.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </div>
    );
  }

  // Main App
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hidden sm:block">
                Collaborative Docs
              </h1>
            </div>
            
            {currentDoc && (
              <>
                <span className="text-gray-300 hidden sm:block">|</span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setHasChanges(true);
                  }}
                  className="text-base font-medium border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-3 py-1.5 bg-gray-50 hover:bg-gray-100 transition-colors max-w-xs sm:max-w-md truncate"
                  placeholder="Document title"
                />
                {hasChanges && !isSaving && (
                  <Badge variant="warning" size="sm">Unsaved</Badge>
                )}
                {isSaving && (
                  <Badge variant="primary" size="sm">
                    <Spinner size="sm" className="w-3 h-3 mr-1" />
                    Saving...
                  </Badge>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 pr-3 border-r border-gray-200">
              <Avatar name={user.name} size="sm" />
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {user.name}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              leftIcon={<LogOut className="w-4 h-4" />}
            >
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`
                fixed lg:relative z-30 w-72 h-[calc(100vh-64px)] overflow-y-auto
                bg-white border-r border-gray-200
              `}
            >
              {/* Action buttons */}
              <div className="p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="flex gap-2">
                  <Button
                    onClick={createDocument}
                    disabled={loading}
                    className="flex-1"
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    New Doc
                  </Button>
                  <label className="cursor-pointer inline-flex">
                    <input
                      type="file"
                      accept=".txt,.md"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={loading}
                    />
                    <Button
                      variant="secondary"
                      disabled={loading}
                      leftIcon={<Upload className="w-4 h-4" />}
                      className="pointer-events-none"
                    >
                      <span className="hidden sm:inline">Upload</span>
                    </Button>
                  </label>
                </div>
              </div>

              {loading && !documents.owned.length && !documents.shared.length ? (
                <SidebarSkeleton />
              ) : (
                <div className="p-4 space-y-6">
                  {/* Owned Documents */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        My Documents
                      </h2>
                      <Badge variant="default" size="sm">
                        {documents.owned.length}
                      </Badge>
                    </div>
                    {documents.owned.length === 0 ? (
                      <EmptyState
                        variant="documents"
                        title="No documents yet"
                        description="Create your first document to get started"
                        action={
                          <Button size="sm" onClick={createDocument} leftIcon={<Plus className="w-3 h-3" />}>
                            Create
                          </Button>
                        }
                      />
                    ) : (
                      <div className="space-y-2">
                        <AnimatePresence>
                          {documents.owned.map((doc) => (
                            <DocumentItem
                              key={doc.id}
                              id={doc.id}
                              title={doc.title}
                              updatedAt={doc.updated_at}
                              isActive={currentDoc?.id === doc.id}
                              onClick={() => openDocument(doc)}
                              onDelete={(e) => deleteDocument(doc.id, e)}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  {/* Shared Documents */}
                  <div className="border-t border-gray-100 pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Shared with Me
                      </h2>
                      <Badge variant="success" size="sm">
                        {documents.shared.length}
                      </Badge>
                    </div>
                    {documents.shared.length === 0 ? (
                      <EmptyState
                        variant="shared"
                        title="No shared documents"
                        description="Documents shared by others will appear here"
                      />
                    ) : (
                      <div className="space-y-2">
                        <AnimatePresence>
                          {documents.shared.map((doc) => (
                            <DocumentItem
                              key={doc.id}
                              id={doc.id}
                              title={doc.title}
                              updatedAt={doc.updated_at}
                              ownerName={doc.owner_name}
                              isShared
                              isActive={currentDoc?.id === doc.id}
                              onClick={() => openDocument(doc)}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-20 lg:hidden cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {currentDoc ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <Card variant="elevated" padding="none" className="overflow-hidden">
                {/* Toolbar */}
                <EditorToolbar
                  onFormat={execCommand}
                  onShare={() => { loadShares(currentDoc.id); setShowShareModal(true); }}
                  onSave={saveDocument}
                  isSaving={isSaving}
                />

                {/* Editor */}
                <div
                  ref={editorRef}
                  contentEditable
                  className="editor-content w-full min-h-[500px] p-6 focus:outline-none prose prose-sm sm:prose-base max-w-none"
                  onInput={handleEditorInput}
                  suppressContentEditableWarning
                  placeholder="Start typing your document..."
                />
              </Card>

              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <span>
                  Last updated: {new Date(currentDoc.updated_at).toLocaleString()}
                </span>
                {hasChanges && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                    Unsaved changes
                  </span>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full min-h-[400px]"
            >
              <Card variant="outlined" padding="lg" className="max-w-md">
                <EmptyState
                  variant="documents"
                  title="Select or create a document"
                  description="Choose a document from the sidebar or create a new one to start editing"
                  action={
                    <>
                      <Button onClick={createDocument} leftIcon={<Plus className="w-4 h-4" />}>
                        New Document
                      </Button>
                      <label className="cursor-pointer inline-flex">
                        <input
                          type="file"
                          accept=".txt,.md"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Button variant="secondary" leftIcon={<FileUp className="w-4 h-4" />} className="pointer-events-none">
                          Upload File
                        </Button>
                      </label>
                    </>
                  }
                />
              </Card>
            </motion.div>
          )}
        </main>
      </div>

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Document"
        description="Invite others to collaborate on this document"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowShareModal(false)}>
              Close
            </Button>
          </div>
        }
      >
        <form onSubmit={handleShare} className="mb-6">
          <Input
            type="email"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            placeholder="bob@example.com"
            label="Add user by email"
            helperText="Available: alice@example.com, bob@example.com, carol@example.com"
            disabled={shareLoading}
            rightIcon={shareLoading ? <Spinner size="sm" /> : undefined}
          />
          <div className="mt-3">
            <Button type="submit" disabled={!shareEmail || shareLoading} leftIcon={<Plus className="w-4 h-4" />}>
              {shareLoading ? 'Adding...' : 'Add User'}
            </Button>
          </div>
        </form>

        <div className="border-t border-gray-100 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Shared with:
          </h4>
          {shares.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Not shared with anyone yet
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <AnimatePresence>
                {shares.map((share) => (
                  <ShareItem
                    key={share.id}
                    email={share.email}
                    name={share.name}
                    onRemove={() => removeShare(share.email)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

// Main export with ToastProvider
export default function Home() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
