import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import {
  MessageSquare,
  Plus,
  Search,
  Send,
  Paperclip,
  User,
  Calendar,
  FileText,
  Wrench,
  Phone,
  Video
} from 'lucide-react';
import apiService from '../../services/apiService';
import toast from 'react-hot-toast';
import NewConversationModal from '../../components/NewConversationModal';
import { useAuth } from '../../context/AuthContext';

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
}

interface Message {
  _id: string;
  sender: User;
  content: string;
  createdAt: string;
  isRead: boolean;
  attachments?: Array<{
    name: string;
    type: string;
    url: string;
  }>;
}

interface Conversation {
  _id: string;
  subject?: string;
  participants: User[];
  lastMessage: Message;
  unreadCount: number;
  messages: Message[];
}

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedConversationData, setSelectedConversationData] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await apiService.messages.getConversations();
      setConversations(response);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Erreur lors du chargement des conversations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleSelectConversation = async (conversationId: string) => {
    setSelectedConversation(conversationId);
    try {
      const conversation = await apiService.messages.getConversation(conversationId);
      setSelectedConversationData(conversation);
    } catch (error) {
      console.error('Error fetching conversation details:', error);
      toast.error('Erreur lors du chargement de la conversation.');
    }
  };

  const sendMessage = async () => {
    if (newMessage.trim() && selectedConversation) {
      try {
        await apiService.messages.sendMessage(selectedConversation, newMessage);
        setNewMessage('');
        handleSelectConversation(selectedConversation); // Refetch conversation to get the latest messages
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error('Erreur lors de l\'envoi du message.');
      }
    }
  };

  const startNewConversation = () => {
    setIsModalOpen(true);
  };

  const handleConversationCreated = () => {
    fetchConversations();
  };

  const filteredConversations = conversations.filter(conv =>
    (conv.subject && conv.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
    conv.participants.some(p => `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Layout>
      <div className="h-[calc(100vh-200px)] flex space-x-6">
        {/* Conversations List */}
        <div className="w-1/3 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <MessageSquare className="w-6 h-6 mr-2 text-primary-600" />
                Messages
              </h1>
            </div>
            <Button size="sm" onClick={startNewConversation}>
              <Plus className="w-4 h-4 mr-1" />
              Nouveau
            </Button>
          </div>

          {/* Search */}
          <Card className="p-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </Card>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {loading ? <p>Chargement...</p> : filteredConversations.map((conversation) => (
              <div
                key={conversation._id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedConversation === conversation._id
                    ? 'border-primary-500 bg-primary-50'
                    : 'hover:shadow-md'
                } ${conversation.unreadCount > 0 ? 'border-l-4 border-l-primary-500' : ''}`}
                onClick={() => handleSelectConversation(conversation._id)}
              >
                <Card
                  className={`p-4 flex items-center space-x-4 ${
                    selectedConversation === conversation._id
                      ? 'bg-primary-50 border-primary-300'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="flex -space-x-2">
                          {conversation.participants.slice(0, 2).map((participant) => (
                            <img
                              key={participant._id}
                              src={participant.avatar || 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2'}
                              alt={`${participant.firstName} ${participant.lastName}`}
                              className="w-8 h-8 rounded-full object-cover border-2 border-white"
                            />
                          ))}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${conversation.unreadCount > 0 ? 'font-semibold' : ''} text-gray-900`}>
                              {conversation.participants.map(p => `${p.firstName || ''} ${p.lastName || ''}`).join(', ')}
                            </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className="text-xs text-gray-500">
                          {conversation.lastMessage && conversation.lastMessage.createdAt ? new Date(conversation.lastMessage.createdAt).toLocaleDateString('fr-FR') : 'Invalid date'}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className={`text-sm ${conversation.unreadCount > 0 ? 'font-semibold' : 'font-medium'}` + ' text-gray-900 mb-1'}>
                        {conversation.subject || 'Conversation'}
                      </h4>
                      <p className="text-xs text-gray-600 line-clamp-2">{conversation.lastMessage && conversation.lastMessage.content}</p>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 flex flex-col">
          {selectedConversationData ? (
            <>
              {/* Thread Header */}
              <Card className="p-6 mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {selectedConversationData.subject || 'Conversation'}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>{selectedConversationData.participants.map(p => `${p.firstName || ''} ${p.lastName || ''}`).join(', ')}</span>
                      </div>
                      {selectedConversationData.messages && selectedConversationData.messages.length > 0 && selectedConversationData.messages[0].createdAt &&
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(selectedConversationData.messages[0].createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                      }
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Thread Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {selectedConversationData.messages && selectedConversationData.messages.map((message) => {
                  const isCurrentUser = message.sender._id === user?._id;
                  
                  return (
                    <div
                      key={message._id}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                        {!isCurrentUser && (
                          <div className="flex items-center space-x-2 mb-1">
                            <img
                              src={selectedConversationData.participants.find(p => p._id === message.sender._id)?.avatar || 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2'}
                              alt={`${message.sender.firstName} ${message.sender.lastName}`}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="text-xs font-medium text-gray-900">{message.sender.firstName || ''} {message.sender.lastName || ''}</span>
                          </div>
                        )}
                        
                        <div className={`rounded-lg p-4 ${
                          isCurrentUser 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {message.attachments.map((attachment, index) => (
                                <div 
                                  key={index}
                                  className={`flex items-center space-x-2 p-2 rounded ${
                                    isCurrentUser ? 'bg-primary-700' : 'bg-gray-200'
                                  }`}
                                >
                                  <Paperclip className={`w-3 h-3 ${isCurrentUser ? 'text-primary-200' : 'text-gray-500'}`} />
                                  <span className={`text-xs ${isCurrentUser ? 'text-primary-100' : 'text-gray-700'}`}>
                                    {attachment.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className={`text-xs text-gray-500 mt-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                          {message.createdAt ? new Date(message.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'Invalid date'}
                          {isCurrentUser && message.isRead && (
                            <span className="ml-1 text-blue-500">✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Form */}
              <Card className="p-4">
                <div className="space-y-4">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tapez votre message..."
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <div className="flex justify-between items-center">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="w-4 h-4 mr-1" />
                      Joindre
                    </Button>
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4 mr-1" />
                      Envoyer
                    </Button>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <Card className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Sélectionnez une conversation pour voir les messages</p>
                <Button variant="ghost" size="sm" className="mt-4" onClick={startNewConversation}>
                  <Plus className="w-4 h-4 mr-1" />
                  Nouvelle conversation
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
      <NewConversationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConversationCreated={handleConversationCreated} 
      />
    </Layout>
  );
};

export default Messages;
